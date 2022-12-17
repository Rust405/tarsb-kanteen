const functions = require('firebase-functions')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')

const dayjs = require('dayjs')
const utc = require("dayjs/plugin/utc")
const timezone = require("dayjs/plugin/timezone")
dayjs.extend(timezone)
dayjs.extend(utc)

const earliestOrder = '07:00'
const latestOrder = '17:00'
const tz = 'Asia/Singapore'

const db = getFirestore()
const stallsRef = db.collection('stalls')

function isWeekend(date) {
    return date.day() === 0 || date.day() === 6
}

exports.createOrder = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    //verify user
    if (context.auth.token.userType !== 'customer') {
        console.log(`${context.auth.token.email} made an unauthorized function call.`)
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a customer to create order.'
        )
    }

    let isSuccess = true
    let messageArray = []

    let order = data.order
    let isPreOrder = order.isPreOrder

    let now = dayjs().tz(tz)
    let earliestOrderTime = dayjs.tz(`${now.format('YYYY-MM-DD')}T${earliestOrder}`, tz)
    let latestOrderTime = dayjs.tz(`${now.format('YYYY-MM-DD')}T${latestOrder}`, tz)

    //IF stall doesn't exist / unregistered, RETURN early
    const stallSnap = await stallsRef.doc(order.stallID).get()
    if (!stallSnap.exists) {
        return { success: false, message: [`Stall does not exist or has been recently unregistered.`] }
    }

    //IF stall is closed AND order is a regular order 
    const stallStatus = (await stallsRef.doc(order.stallID).get()).data().status
    if (stallStatus === 'closed' && !order.isPreOrder) {
        isSuccess = false
        messageArray.push(`The stall is currently closed. You may place a pre-order instead.`)
    }

    //IF SOMEHOW order is created outside of stall hours
    if ((!isPreOrder && now.diff(earliestOrderTime) < 0) || (!isPreOrder && now.diff(latestOrderTime) > 0)) {
        isSuccess = false
        messageArray.push(`Order cannot be created outside of stall operational hours.`)
    }

    //IF SOMEHOW order is empty
    if (order.orderItems.length === 0) {
        isSuccess = false
        messageArray.push(`Order must contain at least one menu item.`)
    }

    //IF SOMEHOW order contains more than one waiting item
    let waitingItems = order.orderItems.filter(item => item.isRequireWaiting)
    if (waitingItems.length > 1) {
        isSuccess = false
        messageArray.push(`Order can only contain a maximum 1 item that requires waiting.`)
    }

    //IF order contains at least one unavailable item
    let unavailableItems = order.orderItems.filter(item => item.isAvailable === false)
    if (unavailableItems.length > 0) {
        isSuccess = false
        messageArray.push(`Order cannot contain any unavailable items.`)
    }

    //IF SOMEHOW regular order is created on a weekend
    if (isWeekend(now) && !order.isPreOrder) {
        isSuccess = false
        messageArray.push(`Order cannot be created on a weekend.`)
    }

    //Validate for pre-order
    if (isPreOrder) {
        //IF pickup date invalid RETURN early
        if (new Date(order.pickupTimestamp).toString() === 'Invalid Date') {
            return { success: false, message: ['Invalid pickup date provided.'] }
        }

        let pickupTimestamp = dayjs(order.pickupTimestamp).tz(tz)
        earliestOrderTime = dayjs.tz(`${pickupTimestamp.format('YYYY-MM-DD')}T${earliestOrder}`, tz)
        latestOrderTime = dayjs.tz(`${pickupTimestamp.format('YYYY-MM-DD')}T${latestOrder}`, tz)

        // IF SOMEHOW preorder is placed on a weekend
        if (isWeekend(pickupTimestamp)) {
            isSuccess = false
            messageArray.push(`Pre-order cannot be placed on a weekend.`)
        }

        // IF SOMEHOW preorder is placed in the past (before 30 minutes after current time)
        if (pickupTimestamp.diff(now.add(30, 'minute'), 'minute') < 0) {
            isSuccess = false
            messageArray.push(`Pre-order can only be placed at a minimum 30 minutes from now.`)
        }

        //IF SOMEHOW preorder is placed outside of stall hours
        if (pickupTimestamp.diff(earliestOrderTime) < 0 || pickupTimestamp.diff(latestOrderTime) > 0) {
            isSuccess = false
            messageArray.push(`Pre-order cannot be placed outside of stall operational hours.`)
        }

        //IF SOMEHOW preorder is placed 7 days ahead of earliestOrderTime
        let latestDate = dayjs(`${now.format('YYYY-MM-DD')}T${latestOrder}`).add(7, 'day')
        if (pickupTimestamp.diff(latestDate) > 0) {
            isSuccess = false
            messageArray.push(`Pre-order can only be placed at a maximum 1 week from today.`)
        }
    }

    if (isSuccess) {
        order.orderTimestamp = Timestamp.fromDate(dayjs().toDate())
        order.customerID = context.auth.token.uid
        order.orderStatus = 'In Queue'
        order.remarkStall = ''

        order.cookingStartTime = Timestamp.now()
        order.cookingEndTime = Timestamp.now()

        if (isPreOrder) {
            order.pickupTimestamp = Timestamp.fromDate(dayjs(order.pickupTimestamp).toDate())
        } else {
            const estWaitTime = order.orderItems.reduce((acc, cur) => acc + cur.data.estWaitTime, 0)
            if (estWaitTime > 0) {
                //last order in queue to complete
                const lastOrderSnap = await db.collection('orders')
                    .where("stallID", "==", order.stallID)
                    .where("orderStatus", "==", "In Queue")
                    .where("isPreOrder", "==", false)
                    .orderBy('estCmpltTimestamp', 'desc')
                    .limit(1)
                    .get()

                const lastOrderDoc = lastOrderSnap.docs.find(doc => doc)

                if (lastOrderDoc) {
                    const estComplete = dayjs(lastOrderDoc.data().estCmpltTimestamp.toDate()).add(estWaitTime, 'minute')
                    order.estCmpltTimestamp = Timestamp.fromDate(estComplete.toDate())
                } else {
                    const estComplete = now.add(estWaitTime, 'minute')
                    order.estCmpltTimestamp = Timestamp.fromDate(estComplete.toDate())
                }
            } else {
                order.estCmpltTimestamp = Timestamp.now()
            }
        }

        //Add order
        const res = await db.collection('orders').add(order)
        messageArray.push(res.id)
    }

    return { success: isSuccess, message: messageArray }
})
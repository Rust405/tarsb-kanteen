const functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')
const dayjs = require('dayjs')

const earliestOrder = '07:00'
const latestOrder = '17:00'

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

    let stallID = data.stallID
    let order = data.order
    let isPreOrder = order.isPreOrder
    order.customerID = context.auth.token.uid

    let now = dayjs().add(8, 'hour') //GMT + 8
    let earliestOrderTime = dayjs(`${now.format('YYYY-MM-DD')}T${earliestOrder}`)
    let latestOrderTime = dayjs(`${now.format('YYYY-MM-DD')}T${latestOrder}`)

    //IF stall is closed AND order is not a preorder
    const stallStatus = (await stallsRef.doc(stallID).get()).data().status
    if (stallStatus === 'closed' && !order.isPreOrder) {
        isSuccess = false
        messageArray.push(`The stall is currently closed. You may place a pre-order instead.`)
    }

    //IF SOMEHOW order is created outside of stall hours
    if ((!isPreOrder && now.diff(earliestOrderTime) < 0) || (!isPreOrder && now.diff(latestOrderTime) > 0)) {
        isSuccess = false
        messageArray.push(`Order cannot be created outside of stall operational hours.`)
    }

    //IF SOMEHOW order is somehow empty
    if (order.orderItems.length === 0) {
        isSuccess = false
        messageArray.push(`Order must contain at least one menu item.`)
    }

    //IF SOMEHOW order contains more than one cooking item
    if (order.orderItems.length !== 0) {
        let waitingItemCtr = 0

        order.orderItems.forEach(item => {
            if (item.isRequireWaiting) {
                waitingItemCtr += 1
            }
        })

        if (waitingItemCtr > 1) {
            messageArray.push(`Order can only contain a maximum 1 item that requires waiting.`)
        }
    }

    //IF order contains at least one unavailable item
    //TODO: 

    //IF SOMEHOW order (not pre-order) is created on a weekend
    if (isWeekend(now) && !order.isPreOrder) {
        isSuccess = false
        messageArray.push(`Order cannot be created on a weekend.`)
    }

    //Validate for pre-order
    if (isPreOrder) {
        let pickupTimestamp = dayjs(order.pickupTimestamp).add(8, 'hour') //GMT + 8
        earliestOrderTime = dayjs(`${pickupTimestamp.format('YYYY-MM-DD')}T${earliestOrder}`)
        latestOrderTime = dayjs(`${pickupTimestamp.format('YYYY-MM-DD')}T${latestOrder}`)

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

        //IF ?

    }

    //add user id to order

    //add order number?

    return { success: isSuccess, message: messageArray }
})
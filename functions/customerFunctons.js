const functions = require('firebase-functions')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')
const { getMessaging } = require('firebase-admin/messaging')

const dayjs = require('dayjs')
const utc = require("dayjs/plugin/utc")
const timezone = require("dayjs/plugin/timezone")
dayjs.extend(timezone)
dayjs.extend(utc)

const earliestOrder = '07:00'
const latestOrder = '17:00'
const tz = 'Asia/Singapore'

const reminderCron = '* 6-17 * * 1-5' //run every minute from 6am-5pm on weekdays
const reminderMin = 10 //minutes, before pickuptime to remind about pre-order 

const db = getFirestore()
const usersRef = db.collection('users')
const stallsRef = db.collection('stalls')
const ordersRef = db.collection('orders')
const remindersRef = db.collection('reminders')

function isWeekend(date) {
    return date.day() === 0 || date.day() === 6
}

function verifyCustomer(token) {
    if (token.userType !== 'customer') {
        console.log(`${token.email} made an unauthorized function call.`)
        throw new functions.https.HttpsError(
            'permission-denied',
            'Must be a verified customer to call this function.'
        )
    }
}

exports.createOrder = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyCustomer(context.auth.token)

    let isSuccess = true
    let messageArray = []

    let order = data.order
    let isPreOrder = order.isPreOrder

    let now = dayjs().tz(tz)
    let earliestOrderTime = dayjs.tz(`${now.format('YYYY-MM-DD')}T${earliestOrder}`, tz)
    let latestOrderTime = dayjs.tz(`${now.format('YYYY-MM-DD')}T${latestOrder}`, tz)

    //IF stall doesn't exist / unregistered, RETURN early, ELSE set the stall name in order
    const stallDoc = await stallsRef.doc(order.stallID).get()
    if (!stallDoc.exists) {
        return { success: false, message: [`Stall does not exist or has been recently unregistered.`] }
    } else {
        order.stallName = stallDoc.data().stallName
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
        order.orderStatus = 'Placed'
        order.remarkStall = ''

        order.estWaitTime = order.orderItems.reduce((acc, cur) => acc + cur.data.estWaitTime, 0)

        if (isPreOrder) {
            order.pickupTimestamp = Timestamp.fromDate(dayjs(order.pickupTimestamp).toDate())
            order.estCmpltTimestamp = order.pickupTimestamp
        } else {
            if (order.estWaitTime > 0) {
                //last order in queue to complete
                const lastOrderSnap = await ordersRef
                    .where("stallID", "==", order.stallID)
                    .where("orderStatus", "==", "Placed")
                    .where("isPreOrder", "==", false)
                    .orderBy('estCmpltTimestamp', 'desc')
                    .limit(1)
                    .get()

                const lastOrderDoc = lastOrderSnap.docs[0]

                //if last order exists
                if (lastOrderDoc) {
                    const lastOrderCmplt = dayjs(lastOrderDoc.data().estCmpltTimestamp.toDate())

                    //if last order is overdue
                    if (now.diff(lastOrderCmplt) > 0) {
                        //calculate estCmpltTimestamp from now 
                        const estComplete = now.add(order.estWaitTime, 'minute')
                        order.estCmpltTimestamp = Timestamp.fromDate(estComplete.toDate())
                    } else {
                        //else calculate estCmpltTimestamp from last order
                        const estComplete = lastOrderCmplt.add(order.estWaitTime, 'minute')
                        order.estCmpltTimestamp = Timestamp.fromDate(estComplete.toDate())
                    }
                } else {
                    //else calculate estCmpltTimestamp from now
                    const estComplete = now.add(order.estWaitTime, 'minute')
                    order.estCmpltTimestamp = Timestamp.fromDate(estComplete.toDate())
                }
            } else {
                order.estCmpltTimestamp = Timestamp.now()
            }
        }

        //Add order
        const res = await ordersRef.add(order)
        messageArray.push(res.id)

        const notificationData = {
            title: `A new ${isPreOrder ? 'pre-order' : 'order'} has been created.`,
            body: `New ${isPreOrder ? 'pre-order' : 'order'} created with ID: #${res.id}`
        }
        sendToStall(order.stallID, notificationData)

        //IF pre-order, create remidner doc
        if (isPreOrder) { createPreorderReminder(res.id, order.customerID, order.stallID, order.pickupTimestamp) }
    }

    return { success: isSuccess, message: messageArray }
})

async function createPreorderReminder(orderID, customerID, stallID, pickupTimestamp) {
    let pickup = dayjs(pickupTimestamp.toDate())
    let reminderTimestamp = pickup.subtract(reminderMin, 'minute')

    await remindersRef.add({
        orderID: orderID,
        customerID: customerID,
        stallID: stallID,
        pickupTimestamp, pickupTimestamp,
        reminderTimestamp: Timestamp.fromDate(reminderTimestamp.toDate())
    })
}

exports.cancelOrder = functions.region('asia-southeast1').https.onCall(async (data, context) => {
    verifyCustomer(context.auth.token)

    let isSuccess = true
    let messageArray = []

    let orderID = data.orderID

    //IF order doesn't exist, RETURN early
    const orderDoc = await ordersRef.doc(orderID).get()
    if (!orderDoc.exists) {
        return { success: false, message: [`Order does not exist.`] }
    }

    //IF order is already cooking, already cancelled, ready, completed, unclaimed
    switch (orderDoc.data().orderStatus) {
        case 'Cooking':
            isSuccess = false
            messageArray.push(`Order has already started cooking.`)
            break
        case 'Ready':
            isSuccess = false
            messageArray.push(`Order has already finished cooking.`)
            break
        case 'Completed':
            isSuccess = false
            messageArray.push(`Order had already been completed.`)
            break
        case 'Cancelled':
            isSuccess = false
            messageArray.push(`Order had already been cancelled.`)
            break
        case 'Unclaimed':
            isSuccess = false
            messageArray.push(`Order had already been marked unclaimed.`)
            break
        default:
            isSuccess = true
    }


    //Cancel order
    if (isSuccess) {
        await ordersRef.doc(orderID).update({ orderStatus: 'Cancelled' })

        const notificationData = {
            title: `An order was cancelled by the customer.`,
            body: `Order #${orderID} has been cancelled.`
        }
        sendToStall(orderDoc.data().stallID, notificationData)

        //IF Preorder, remove reminder
        if (orderDoc.data().isPreOrder) {
            remindersRef.where("orderID", "==", orderID).get()
                .then(reminders => {
                    reminders.forEach(reminder => {
                        remindersRef.doc(reminder.id).delete()
                    })
                })
        }
    }

    return { success: isSuccess, message: messageArray }
})

async function sendToStall(stallID, notificationData) {
    const stallDoc = await stallsRef.doc(stallID).get()

    const ownerEmail = stallDoc.data().ownerEmail
    const staffEmails = stallDoc.data().staffEmails

    let fcmTokens = []

    //add ownerEmail fcmToken
    const ownerSnap = await usersRef.where("email", "==", ownerEmail).get()
    const ownerTokens = ownerSnap.docs[0].data().fcmTokens
    if (ownerTokens && ownerTokens.length > 0) fcmTokens = fcmTokens.concat(ownerTokens)


    //add staffEmails fcmToken
    if (staffEmails.length) {
        const staffSnap = await usersRef.where("email", "in", staffEmails).get()
        staffSnap.forEach(user => {
            const staffTokens = user.data().fcmTokens
            if (staffTokens && staffTokens.length > 0) fcmTokens = fcmTokens.concat(staffTokens)
        })
    }

    if (fcmTokens.length === 0) {
        console.log("fcmTokens not found.")
        return
    }

    const message = {
        data: notificationData,
        tokens: fcmTokens
    }

    getMessaging().sendMulticast(message)
        .then((response) => {
            if (response.failureCount > 0) {
                const failedTokens = []
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(message.tokens[idx])
                    }
                })
                console.log('List of tokens that caused failures: ' + failedTokens)
            } else {
                console.log('Successfully sent message:', response)
            }
        })
}

async function sendToCustomer(receiverUID, notificationData) {
    const userDoc = await usersRef.doc(receiverUID).get()

    const fcmTokens = userDoc.data().fcmTokens
    if (!fcmTokens && fcmTokens.length < 0) {
        console.log("fcmTokens not found.")
        return
    }

    const message = {
        data: notificationData,
        tokens: fcmTokens
    }

    getMessaging().sendMulticast(message)
        .then((response) => {
            if (response.failureCount > 0) {
                const failedTokens = []
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(message.tokens[idx])
                    }
                })
                console.log('List of tokens that caused failures: ' + failedTokens)
            } else {
                console.log('Successfully sent message:', response)
            }
        })
}

exports.sendReminderNotification = functions.region('asia-southeast1').pubsub.schedule(reminderCron).timeZone('Asia/Singapore').onRun(async (context) => {
    const unsentReminders = await remindersRef
        .where("reminderTimestamp", "<=", Timestamp.now())
        .get()

    if (!unsentReminders.empty) {
        unsentReminders.forEach(async unsentReminder => {
            const stallReminder = {
                title: `Reminder: Cook Pre-order #${unsentReminder.data().orderID}.`,
                body: `Scheduled for pickup at ${dayjs.tz(unsentReminder.data().pickupTimestamp.toDate(), tz).format('DD/MM/YYYY (ddd) HH:mm')}.`
            }
            sendToStall(unsentReminder.data().stallID, stallReminder)

            const customerReminder = {
                title: `Reminder: Pick up Pre-order #${unsentReminder.data().orderID}.`,
                body: `Scheduled for pickup at ${dayjs.tz(unsentReminder.data().pickupTimestamp.toDate(), tz).format('DD/MM/YYYY (ddd) HH:mm')}.`
            }
            sendToCustomer(unsentReminder.data().customerID, customerReminder)

            await remindersRef.doc(unsentReminder.id).delete()
        })
    }


    return null
})
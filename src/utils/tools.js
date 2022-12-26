export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const shortOrderString = (orderItems) => {
    let orderString = orderItems[0].data.menuItemName

    if (orderItems.length > 1) {
        orderString += ` + ${orderItems.length - 1} other item(s)`
    }

    return orderString
}
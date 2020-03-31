// Fetches the existing number value (if any) whenenevr a number column is being updated
const updateNumberColumn = (changes, row, column) => {
    return changes[column] ? (parseFloat(changes[column]) + parseFloat(row[column])) : row[column]
}


module.exports = {
    updateNumberColumn
}
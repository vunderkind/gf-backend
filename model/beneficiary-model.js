const db = require('../data/dbconfig');

module.exports = {
    find,
    findById,
    add,
    bulkUpdate,
    update,
    remove
}

function find() {
    return db('beneficiaries');
}

function findById(id) {
    return db('beneficiaries').where({
        id
    }).first();
}


function add(user) {
    return db('beneficiaries')
        .insert(user);
}

function update(edits, id) {
    return db('beneficiaries')
        .update(edits)
        .where({
            id
        });
}

function bulkUpdate(edits, ids) {
    return db('beneficiaries')
        .update(edits)
        .whereIn('id', ids)
}

function remove(id) {
    return db('beneficiaries')
        .delete('beneficiaries')
        .where({
            id
        });
}
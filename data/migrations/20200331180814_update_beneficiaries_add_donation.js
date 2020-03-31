exports.up = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.float('donationAmount').defaultTo(0)
        tbl.float('donationCount').defaultTo(0)
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.dropColumn('donationCount')
        tbl.dropColumn('donationAmount')
    })
};
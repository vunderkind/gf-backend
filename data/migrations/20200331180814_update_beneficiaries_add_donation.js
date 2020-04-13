exports.up = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.int('donationAmount').defaultTo(0)
        tbl.int('donationCount').defaultTo(0)
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.dropColumn('donationCount')
        tbl.dropColumn('donationAmount')
    })
};
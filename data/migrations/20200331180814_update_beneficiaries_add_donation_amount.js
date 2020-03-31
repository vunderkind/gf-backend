exports.up = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.float('donationAmount').defaultTo(0)
    })

};

exports.down = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.dropColumn('donationAmount')
    })
};
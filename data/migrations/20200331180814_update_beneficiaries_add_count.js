exports.up = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.integer('donationCount').defaultTo(0)
    })

};

exports.down = function (knex, Promise) {
    return knex.schema.table('beneficiaries', tbl => {
        tbl.dropColumn('donationCount')
    })
};
describe('Logs in', function() {
    it('Successfully loads', function () {
        cy.visit('/')
    })

    it('Logs in', function () {
        cy.login()
    })
})

let composers = ["Bjørn", "Øystein"];


describe('Filters on composers', function () {
    it('Is initially unfiltered' , function () {
        cy.contains('All Composers')
    })

    it('Filters on Øystein', function () {
        cy.get('.scoreList').contains(composers[0])
        cy.get('.scoreList').contains(composers[1])
        cy.contains('All Composers').click()
        cy.get('li').contains(composers[1]).click()
        cy.get('li').contains(composers[1]).should('not.exist')
        cy.get('.scoreList').contains(composers[1])
        cy.get('.scoreList').contains(composers[0]).should('not.exist')
    })

    it('Turns off filter', function () {
        cy.contains(composers[1]).click()
        cy.get('li').contains('All Composers').click()
        cy.get('.scoreList').contains(composers[0])
        cy.get('.scoreList').contains(composers[1])
    })


})

describe('Filters on instruments', function () {
    it('Is initially unfiltered' , function () {
        cy.contains('All Instruments')
    })

    it('Filters on guitar', function () {
        cy.contains('All Instruments').click()
        cy.get('li').contains('Guitar').click()
        cy.get('li').contains('Guitar').should('not.exist')
        cy.contains('Guitar')

    })
})


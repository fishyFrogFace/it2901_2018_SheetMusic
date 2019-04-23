describe('My first test ', function () {
    it('Does not do much!', function () {
        expect(true).to.equal(true)
    })

    it('Does not do much!', function() {
        expect(true).to.equal(false)
    })

    it('Visits the Kitchen Sink', function() {
        cy.visit('https://example.cypress.io')
    })

    describe('My First Test', function() {
        it('Gets, types and asserts', function() {
            cy.visit('https://example.cypress.io')

            cy.contains('type').click()

            // Should be on a new URL which includes '/commands/actions'
            cy.url().should('include', '/commands/actions')

            // Get an input, type into it and verify that the value has been updated
            cy.get('.action-email')
                .type('fake@email.com')
                .should('have.value', 'fake@email.com')
        })
    })

})
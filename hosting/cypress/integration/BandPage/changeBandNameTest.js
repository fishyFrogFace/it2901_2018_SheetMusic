import { text } from "body-parser";

let changedBandName = 'Changed Band Name'

describe('Changing a bands name', function () {
    it('Successfully loads and logins', function () {
        cy.visit('/')
        cy.login()
        cy.url().should('include', '/localhost')
    });    

    it('Switches to your band page', function () {
        cy.contains('Your band').click()
        cy.url().should('include', '/members')
    });

    it('Saves the original name', function () {
        cy.get('#band-name-title').invoke('text').as('originalBandName')
    })

    it('Changing the band name', function () {
        cy.get('#see-more-band-button').click()
        cy.get('#change-bandName-button').click()
        cy.get('#dialog-textfield').click().type(changedBandName)
        cy.contains('button', 'Confirm').click()
    });

    it('Checking if band name changed', function () {
        cy.contains('#band-name-title', changedBandName)
    });

    it('Changing back to the original band name', function () {
        cy.get('#see-more-band-button').click()
        cy.get('#change-bandName-button').click()
        cy.get('#dialog-textfield').click().type(this.originalBandName)
        cy.contains('button', 'Confirm').click()
    });

    // Not working as it should
    // it('Checking for page errors', function () {
    //     cy.contains('Error').should('not.exist')
    //     cy.contains('error').should('not.exist')
    // });

});

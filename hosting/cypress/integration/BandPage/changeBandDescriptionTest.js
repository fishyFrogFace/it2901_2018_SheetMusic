// import { text } from "body-parser";

// let newDesc = 'This is a test description'

// describe('Changing a bands description', function () {
//     it('Successfully loads and logins', function () {
//         cy.visit('/')
//         cy.login()
//         cy.url().should('include', '/localhost')
//     });

//     it('Switches to your band page', function () {
//         cy.contains('Your band').click()
//         cy.url().should('include', '/members')
//     });


//     it('Saves the original description', function () {
//         cy.contains('p', 'Band description').should('exist')
//         cy.get('#band-description-text').invoke('text').as('originalBandDesc')
//     })

//     it('Changing the band description', function () {
//         cy.get('#see-more-band-button').click()
//         cy.get('#change-bandDesc-button').click()
//         cy.get('#dialog-textfield').click().type(newDesc)
//         cy.contains('button', 'Confirm').click()
//     });

//     it('Checking if band description changed', function () {
//         cy.contains('#band-description-text', origi)
//     });

//     it('Changing back to the original band name', function () {
//         cy.get('#see-more-band-button').click()
//         cy.get('#change-bandDesc-button').click()
//         cy.get('#dialog-textfield').click().type(this.originalBandDesc)
//         cy.contains('button', 'Confirm').click()
//     });


//     it('Adding new band description', function () {
//         cy.contains('span', 'Add description').should('exist')
//         cy.contains('span', 'Add description').click()
//         cy.get('#dialog-textfield').click().type(newDesc)
//         cy.contains('button', 'Confirm').click()
//     });

//     it('Checking if band description changed', function () {
//         cy.contains('#band-description-text', newDesc)
//     });


//     // Not working as it should
//     // it('Checking for page errors', function () {
//     //     cy.contains('Error').should('not.exist')
//     //     cy.contains('error').should('not.exist')
//     // });

// });

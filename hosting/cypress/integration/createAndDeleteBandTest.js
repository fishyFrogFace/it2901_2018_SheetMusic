
const bandButtonClass = "button.MuiButtonBase-root-91 MuiButton-root-744 MuiButton-sizeSmall-756";
const createBandButtonClass = ".MuiButtonBase-root-91 MuiListItem-root-765 MuiListItem-default-768 MuiListItem-gutters-772 MuiListItem-button-773 MuiMenuItem-root-1342";

// NOT WORKING ATM 

describe('Creating and deleting a band', function () {
    it('successfully loads and logins', function () {
        cy.visit('/')
        cy.login()
        cy.url().should('include', '/localhost')
    });

    it('Create band', function () {
        cy.get(bandButtonClass).click()
    });


    it('Switches to your band page', function () {
        cy.contains('Your band').click()
        cy.url().should('include', '/members')
    });


});


let changedBandName = 'Changed Band Name'
let bandName = 'Testband'
let newDesc = 'This is a test description'


describe('Logging into website', function () {
    it('Successfully loads', function () {
        cy.visit('/')
    });

    it('Successfully logs in', function () {
        cy.login()
        cy.url().should('include', '/localhost')
    });
});


describe('Creating a new band', function () {
    it('Creates a new band', function () {
        cy.get('#select-band-button').click()
        cy.get('#create-band-button').click()
        cy.get('#dialog-textfield').click().type(bandName)
        cy.contains('button', 'Create').click()
    });

    it('Switches to your bands page', function () {
        cy.contains('Your band').click()
        cy.url().should('include', '/members')
    });

    it('Checks if the band was created', function () {
        cy.contains('#band-name-title', bandName)
    });
});


describe('Changing a bands name', function () {
    it('Changing the band name', function () {
        cy.get('#see-more-band-button').click()
        cy.get('#change-bandName-button').click()
        cy.get('#dialog-textfield').click().type(changedBandName)
        cy.contains('button', 'Confirm').click()
    });

    it('Checking if band name changed', function () {
        cy.contains('#band-name-title', changedBandName)
    });
});


describe('Adding a new band description', function () {
    it('Adding new band description', function () {
        cy.contains('span', 'Add description').click()
        cy.get('#dialog-textfield').click().type(newDesc)
        cy.contains('button', 'Confirm').click()
    });

    it('Checking if band description changed', function () {
        cy.contains('#band-description-text', newDesc)
    });
});


describe('Deleting the band', function () {
    it('Deleting the band', function () {
        cy.get('#see-more-band-button').click()
        cy.get('#delete-band-button').click()
        cy.contains('button', 'Confirm').click()
        cy.wait(200)
        cy.contains('#band-name-title', bandName).should('not.exist')
    });
});
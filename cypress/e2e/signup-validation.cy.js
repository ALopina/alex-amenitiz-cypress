/// <reference types="cypress" />

const SELECTORS = {
    createMyAccountBtn: "#sign-up",
    email: "#user_email",
    password: "#user_password",
    helpBlock: ".help-block",
    termsAgreementCheckbox: "#user_tos_agreement",
    emailContainer: ".email-input-container",
    passwordContainer: ".password-input-container",
    checkbox: ".checkbox",
}

const PATHNAMES = require("../fixtures/pathnames.json")
const userData = require("../fixtures/user_data.json")
const validationErrors = require("../fixtures/validation_messages.json")

describe("sign-up form", () => {
    it("checks validation errors", () => {
        cy.visit(PATHNAMES.signup.form)
            .get(SELECTORS.createMyAccountBtn).click()
            .get(SELECTORS.emailContainer).within(() => {
                cy.get(SELECTORS.helpBlock).should('be.visible').and('contain.text', validationErrors.requiredField)
            })
            .get(SELECTORS.passwordContainer).within(() => {
                cy.get(SELECTORS.helpBlock).should('be.visible').and('contain.text', validationErrors.requiredField).and('contain.text', validationErrors.passwordTip)
            })

        cy.get(SELECTORS.email).type(userData.invalidEmail)
            .get(SELECTORS.password).type(userData.validPassword)
            .get(SELECTORS.createMyAccountBtn).click()
            .get(SELECTORS.emailContainer).within(() => {
                cy.get(SELECTORS.helpBlock).should('be.visible').and('contain.text', validationErrors.invalid)
            })

        cy.get(SELECTORS.email).clear().type(userData.validEmail)
            .get(SELECTORS.password).type(userData.invalidPassword)
            .get(SELECTORS.createMyAccountBtn).click()
            .get(SELECTORS.emailContainer).should('not.contain.text', validationErrors.invalid)
            .get(SELECTORS.passwordContainer).should('contain.text', validationErrors.shortPassword)

        cy.get(SELECTORS.password).type(userData.validPassword)
            .get(SELECTORS.createMyAccountBtn).click()
            .get(SELECTORS.checkbox).within(() => {
                cy.get('input').should('have.attr', 'aria-invalid')
            })
    })
})
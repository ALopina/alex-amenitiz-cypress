/// <reference types="cypress" />


const PATHNAMES = require("../fixtures/pathnames.json")
const userData = require("../fixtures/user_data.json")
const hotelData = require("../fixtures/hotel_data.json")

const SIGNUP_SELECTORS = {
  createMyAccountBtn: "#sign-up",
  email: "#user_email",
  password: "#user_password",
  helpBlock: ".help-block",
  termsAgreementCheckbox: "#user_tos_agreement",
  emailContainer: ".email-input-container",
  passwordContainer: ".password-input-container",
  checkbox: ".checkbox",
  logInBtn: "input[type='submit']",
  firstName: "#user_first_name",
  lastName: "#user_last_name",
  hotelName: "input#hotel_name",
  hotelPhone: "input#phone_number",
  hotelCountry: "select#hotel_info_country",
  langFlagEn: "#flag-en",
  hotelPropType: "div[data-type='hotel']",
  websiteBuilder: "#wb_btn",
  bookingEngine: "#be_btn",
  confirmationCode: "#otp",
  sendCode: ".otp-login"
}

let inboxId
let emailAddress

describe("new user journey!", () => {
  it("sign-up with valid credentials and terms agreement", () => {
    cy.createInbox().then((inbox) => {
      assert.isDefined(inbox)
      inboxId = inbox.id
      emailAddress = inbox.emailAddress

      cy.visit(PATHNAMES.signup.form)
        .get(SIGNUP_SELECTORS.email).type(emailAddress)
        .get(SIGNUP_SELECTORS.password).type(userData.validPassword)
        .get(SIGNUP_SELECTORS.termsAgreementCheckbox).check()
        .get(SIGNUP_SELECTORS.createMyAccountBtn).click()

      //fill out introduce form - https://app.amenitiz-demo.io/en/hotel/owner
      cy.url().should('include', PATHNAMES.signup.hotelOwnerStep)
        .get(SIGNUP_SELECTORS.firstName).type(userData.firstName)
        .get(SIGNUP_SELECTORS.lastName).type(userData.lastName)
        .get("button#confirm").click()

      //fill out contacts form - https://app.amenitiz-demo.io/en/hotel/property
      cy.url().should('include', PATHNAMES.signup.hotelPropertyStep)
        .get(SIGNUP_SELECTORS.hotelName).type(hotelData.name + (new Date()).getTime())
        .get(SIGNUP_SELECTORS.hotelPhone).type(hotelData.phone)
        .get("button#confirm").click()

      //fill out language form - https://app.amenitiz-demo.io/en/hotel/language
      cy.url().should('include', PATHNAMES.signup.languageStep)
        .get(SIGNUP_SELECTORS.hotelCountry).select(hotelData.country).should('have.value', "ES")
        .get(SIGNUP_SELECTORS.langFlagEn).click()
        .get("button[type='submit']").click()

      //fill out property type form - https://app.amenitiz-demo.io/en/hotel/property-type
      cy.url().should('include', PATHNAMES.signup.propertyTypeStep)
        .get(SIGNUP_SELECTORS.hotelPropType).click()
        .get("button#confirm").click()

      //fill out trial plan - url https://lorem-ipsum-hotel.amenitiz-demo.io/en/hotel/trial-plan
      cy.url().should('include', PATHNAMES.signup.trialSelectionStep)
        .get(SIGNUP_SELECTORS.websiteBuilder).click()
        .get(SIGNUP_SELECTORS.bookingEngine).click()
        .get("button#confirm").click()

      cy.url().should('include', PATHNAMES.admin.dashboard)

    })

  })

  it("sign-in with valid credentials & verification code", () => {
    cy.visit(PATHNAMES.signin.form)
      .get(SIGNUP_SELECTORS.email).type(emailAddress)
      .get(SIGNUP_SELECTORS.password).type(userData.validPassword)
      .get(SIGNUP_SELECTORS.logInBtn).click()

    //two-step verification code
    cy.url().should('include', PATHNAMES.signin.twoStepAuth)
    cy.waitForLatestEmail(inboxId).then((email) => {
      assert.isDefined(email)

      // verify that email contains the code
      assert.strictEqual(/two step verification code/.test(email.body), true)

      // extract the confirmation code
      const code = email.body.match(/<b>([0-9]{6})<\/b>/i)[1]
      assert.isDefined(code)
      cy.get(SIGNUP_SELECTORS.confirmationCode).type(code)
      cy.get(SIGNUP_SELECTORS.sendCode).click()

      cy.url().should('include', PATHNAMES.admin.dashboard)

    })

  })

})

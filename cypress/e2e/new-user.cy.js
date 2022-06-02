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

const SIDEBAR_SELECTORS = {
  property: "#js-btn-property",
  general: "p[data-segment-event='Property General Clicked']",
  rooms: "p[data-segment-event='Property Rooms Clicked']"
}

const PROPERTY_SELECTORS = {
  propertyName: "#hotel_info_hotel_name",
  email: "#hotel_info_hotel_email",
  phone: "#hotel_info_phone_number",
  additionalPhone: "#hotel_info_optional_phone_number",
  registrationNumber: "#hotel_info_company_registration_number",
  address: "#hotel_info_address",
  city: "#hotel_info_city",
  zipCode: "#hotel_info_zip",
  region: "#hotel_info_region",
  country: "#hotel_info_country",
  saveBtn: "button[type='submit']",
  selectedCountry: "select#hotel_info_country option:selected",
}

const ROOM_SELECTORS = {
  accomodationType: "select#room_room_type",
  selectedAccomodationType: "select#room_room_type option:selected",
  name: "input#room_name_en",
  description: "div[aria-multiline='true']",
  numberOfRooms: "input#room_number_of_rooms",
  maxGuests: "input#room_max_occupancy",
  maxAdults: "input#room_max_adults",
  roomSize: "input#room_size",
  seaView: "#sea_view",
  defaultPrice: "input#room_default_price",
  vatRate: "input#room_vat_rate",
  visibleOnBookingEngine: "select#room_shown_on_amenitiz",
  visibleOnBEselected: "select#room_shown_on_amenitiz option:selected",
  visibleOnWebsite: "select#room_shown_on_website",
  visibleOnWSselected: "select#room_shown_on_website option:selected",
  bedType: "select[data-qa='select_bed_type']",
  quantity: "input[data-qa='input_bed_number']",
  addBedBtn: ".js-add-bed",
  viewAllAmenities: "p#view-all",
  roomAmenities: ".checkbox",
  roomGallery: "#list-pictures-room img",
  uploadImage: "#room_photos",
  saveBtn: "form#new_room button[type='submit']"
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

  it("fill out general form", () => {
    cy.visit(PATHNAMES.signin.form)
      .get(SIGNUP_SELECTORS.email).type(emailAddress)
      .get(SIGNUP_SELECTORS.password).type(userData.validPassword)
      .get(SIGNUP_SELECTORS.logInBtn).click()

    cy.get(SIDEBAR_SELECTORS.property).click()
      .get(SIDEBAR_SELECTORS.general).should('have.descendants', "a").click()
    cy.url().should('include', PATHNAMES.admin.hotelPropertiesSetup)
      .get(PROPERTY_SELECTORS.propertyName).clear().type(hotelData.propertyName)
      .get(PROPERTY_SELECTORS.email).should('have.value', emailAddress)
      .get(PROPERTY_SELECTORS.phone).should('have.value', hotelData.phone)
      .get(PROPERTY_SELECTORS.address).type(hotelData.address)
      .get(PROPERTY_SELECTORS.city).type(hotelData.city)
      .get(PROPERTY_SELECTORS.zipCode).type(hotelData.zip)
      .get(PROPERTY_SELECTORS.selectedCountry).should('have.text', hotelData.country)
      .get(PROPERTY_SELECTORS.saveBtn).click()

    cy.url().should('include', PATHNAMES.admin.dashboard)

  })

  it("fill out property form", function () {
    const roomData = require("../fixtures/new_room.json")

    cy.visit(PATHNAMES.signin.form)
      .get(SIGNUP_SELECTORS.email).type(emailAddress)
      .get(SIGNUP_SELECTORS.password).type(userData.validPassword)
      .get(SIGNUP_SELECTORS.logInBtn).click()

    cy.get(SIDEBAR_SELECTORS.property).click()
      .get(SIDEBAR_SELECTORS.rooms).should('have.descendants', "a").click()
    cy.url().should('include', PATHNAMES.admin.hotelRoomsList)

    //fill out rooms form
    cy.get("button[type='submit']").click()
      .url().should('include', PATHNAMES.admin.newRoom)
      .get(ROOM_SELECTORS.selectedAccomodationType).should('have.text', roomData.type)
      .get(ROOM_SELECTORS.name).type(roomData.name)
      .get(ROOM_SELECTORS.description).type(roomData.description)
      .get(ROOM_SELECTORS.numberOfRooms).clear().type(roomData.number)
      .get(ROOM_SELECTORS.maxGuests).clear().type(roomData.maxGuests)
      .get(ROOM_SELECTORS.maxAdults).clear().type(roomData.maxAdults)
      .get(ROOM_SELECTORS.roomSize).clear().type(roomData.size)
      .get(ROOM_SELECTORS.seaView).click().should('have.descendants', ".icon_check_in_circle")

      .get(ROOM_SELECTORS.defaultPrice).clear().type(roomData.price)
      .get(ROOM_SELECTORS.vatRate).clear().type(roomData.vat)
      .get(ROOM_SELECTORS.visibleOnBEselected).should('have.text', "Yes")
      .get(ROOM_SELECTORS.visibleOnWSselected).should('have.text', "Yes")
      .get(ROOM_SELECTORS.bedType).select(roomData.bedType)
      .get(ROOM_SELECTORS.quantity).clear().type(roomData.bedQty)
      .get(ROOM_SELECTORS.viewAllAmenities).click()

    for (const feature of roomData.features) {
      cy.get(ROOM_SELECTORS.roomAmenities).contains(feature).click()
    }

    cy.get(ROOM_SELECTORS.uploadImage).selectFile("cypress/fixtures/images/test-hotel-room.jpg", { force: true })
      .get(ROOM_SELECTORS.roomGallery, { timeout: 10000 }).should('have.length', 1)
      .get(ROOM_SELECTORS.saveBtn).contains("Save").click()

    // assert room created
    cy.url().should('include', PATHNAMES.admin.hotelRoomsList)
    cy.get(".a__card").should('include.text', roomData.name)

  })

})

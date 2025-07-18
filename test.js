// @ts-nocheck
import { Builder, By, Browser, until } from "selenium-webdriver";
import { faker } from "@faker-js/faker";

const email = "root@ca.com";
const pass = "qweqwe";

const setAngularInput = `
  const input = arguments[0];
  const value = arguments[1];
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));
`;

async function waitAndFill(driver, xpath, value, isInput = true, waitTimeout = 15000) {
  const element = await driver.wait(until.elementLocated(By.xpath(xpath)), waitTimeout);
  await driver.wait(until.elementIsVisible(element), waitTimeout);
  if (isInput && value !== null) {
    await driver.executeScript(setAngularInput, element, value);
  } else if (!isInput) {
    await element.click();
  }
  // Small delay to ensure UI catches up
  await driver.sleep(700);
  return element;
}

async function Testrun() {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();

  try {
    await driver.get("https://caeaglevision-uat.connectauz.com.au/");
    await driver.manage().window().maximize();

    // Login form
    await waitAndFill(driver, "//input[@formcontrolname='username']", email);
    await waitAndFill(driver, "//input[@formcontrolname='password']", pass);
    await waitAndFill(driver, "//input[@value='Login']", null, false);

    // Navigate to Clients menu
    const clientsMenuXPath = "//a[@href='/client' and .//span[text()='Clients']]";
    await waitAndFill(driver, clientsMenuXPath, null, false);

    // Click Add Clients button
    const addClientBtnXPath = "//a[@href='/client/add' and contains(., 'Add Clients')]";
    await waitAndFill(driver, addClientBtnXPath, null, false);

    // === Fill Client Info ===
    await waitAndFill(driver, "(//input[@formcontrolname='name'])[1]", faker.name.fullName());

    // isSingle select - random between "0: true" and "1: false"
    const isSingleValue = faker.datatype.boolean() ? "0: true" : "1: false";
    await waitAndFill(driver, `//select[@formcontrolname='isSingle']/option[@value='${isSingleValue}']`, null, false);

    await waitAndFill(driver, "//input[@formcontrolname='noOfDependent']", faker.datatype.number({ min: 0, max: 5 }).toString());
    await waitAndFill(driver, "//input[@formcontrolname='address']", faker.address.streetAddress());

    const states = [
      'f6714ee6-ad71-446a-aadb-987b6b784b56', 'e7b7bf86-c777-41d1-a54f-d00f1edc85e1',
      'cf2d3a5d-03fd-45f6-8625-ca0fc1446820', '5953f7b5-bb6f-489a-8391-1dc45a143c2a',
      'e8707367-78e6-4d0e-ad1f-9805fcdc39d0', '6a4c0246-eeb2-4131-bab5-d8435dc39230',
      'e7dbaef4-7fb6-4656-9752-6d577761ba42', '510111a7-1350-466c-b372-f4238c0da668'
    ];
    const randomState = states[Math.floor(Math.random() * states.length)];
    await waitAndFill(driver, `//select[@formcontrolname='stateId']/option[@value='${randomState}']`, null, false);

    // === First Applicant ===
    await waitAndFill(driver, "(//input[@formcontrolname='name'])[2]", faker.name.fullName());

    const genderOptions = ["Male", "Female", "Other"];
    const gender = genderOptions[Math.floor(Math.random() * genderOptions.length)];
    await waitAndFill(driver, `(//select[@formcontrolname='gender'])[1]/option[@value='${gender}']`, null, false);

    // DOB picker for first applicant
    const dobInput1 = await waitAndFill(driver, "(//input[@formcontrolname='dob'])[1]", null, false);
    // Wait for datepicker and pick day 16 (if visible)
    await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'btn-light') and text()='1']")), 15000);
    const dobDay1 = await driver.findElement(By.xpath("//div[contains(@class, 'btn-light') and text()='1']"));
    await dobDay1.click();
    await driver.sleep(700);

    await waitAndFill(driver, "//input[@formcontrolname='phone']", faker.phone.number("04########"));
    await waitAndFill(driver, "//input[@formcontrolname='email']", faker.internet.email());
    await waitAndFill(driver, "//input[@formcontrolname='password']", "qweqwe");
    await waitAndFill(driver, "//textarea[@formcontrolname='notes'][1]", faker.lorem.sentence());

    await waitAndFill(driver, "//button[normalize-space(text())='SAVE & CONTINUE']", null, false);
   

  //Property Information
  const isMortgageValue = faker.datatype.boolean() ? "0: true" : "1: false";
  await waitAndFill(driver, "//select[@formcontrolname='isMortgage']/option[@value='" + isMortgageValue + "']", null, false);

  
  await waitAndFill(driver, "//button[contains(@class, 'shift-manager-actions__button') and contains(@class, 'section-toggle-button')])[1]", null, false);




    // Final wait to let submission complete
    await driver.sleep(1000);
  } catch (err) {
    console.error("❌ Error during test run:", err.message, err.stack);
  } finally {
    await driver.wait();
  }
}

Testrun();
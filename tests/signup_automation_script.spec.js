import { test, expect } from "@playwright/test";
import MailSlurp from "mailslurp-client";
import { parse } from "node-html-parser";
import dotenv from "dotenv";

dotenv.config();

function generatePhoneNumber() {
  return `98${Math.floor(10000000 + Math.random() * 90000000)}`;
}

test("Signup Automation test demo", async ({ page }) => {
  const mailslurp = new MailSlurp({
    apiKey: process.env.MAILSLURP_API_KEY,
  });

  const { id, emailAddress } = await mailslurp.createInbox();
  console.log("Using email:", emailAddress);

  const phoneNumber = generatePhoneNumber();
  console.log("Using phone number:", phoneNumber);

  await page.goto("https://authorized-partner.vercel.app/");
  await page.click("//p[normalize-space()='Login']");
  await page.click("//a[normalize-space()='Sign Up']");
  await page.click("//button[@id='remember']");
  await page.click("//button[normalize-space()='Continue']");

  await page.getByRole("textbox", { name: "First Name" }).fill("Kumar");
  await page.getByRole("textbox", { name: "Last Name" }).fill("Basnet");
  await page.getByRole("textbox", { name: "Email Address" }).fill(emailAddress);
  await page.getByRole("textbox", { name: "Phone Number" }).fill(phoneNumber);
  await page.locator('[name="password"]').fill("Kumar@2059");
  await page.locator('[name="confirmPassword"]').fill("Kumar@2059");
  await page.click("//button[normalize-space()='Next']");

  const email = await mailslurp.waitForLatestEmail(id, 30000);

  const htmlRoot = parse(email.body);
  const otpElement = htmlRoot.querySelector('p[style*="font-weight: bold"]');

  if (!otpElement) {
    console.log("HTML body:", email.body);
    throw new Error("OTP not found in the HTML email");
  }

  const otp = otpElement.text.trim();
  console.log("Extracted OTP:", otp);

  await page.fill("//input[@class='disabled:cursor-not-allowed']", otp);
  await page.click("//button[normalize-space()='Verify Code']");

  await page
    .getByRole("textbox", { name: "Name" })
    .fill("Brightwave Solutions");
  await page.getByRole("textbox", { name: /Role in Agency/i }).fill("CEO");
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill("brightwavesolutions@gmail.com");
  await page
    .getByRole("textbox", { name: "Website" })
    .fill("www.brightwave.com");
  await page
    .getByPlaceholder("Enter Your Agency Address")
    .fill("Kathmandu, Nepal");
  await page.locator(':text-is("Select Your Region of Operation")').click();
  await page.getByText("Australia").click();
  await page.click("//button[normalize-space()='Next']");

  await page.getByRole("combobox", { name: "Years of Experience" }).click();
  await page.getByRole("option", { name: "5 years" }).click();
  await page.getByLabel("Number of Students Recruited Annually").fill("150");
  await page
    .getByRole("textbox", { name: "Focus Area" })
    .fill("USA, Australia");
  await page.getByLabel("Success Metrics").fill("92");
  await page.getByRole("checkbox", { name: "Career Counseling" }).check();
  await page.getByRole("checkbox", { name: "Visa Processing" }).check();
  await page.getByRole("button", { name: "Next" }).click();

  await page.getByLabel("Business Registration Number").fill("123456789");
  await page.getByRole("combobox", { name: "Preferred Countries" }).click();
  await page.getByText("Australia", { exact: true }).click();
  await page.getByRole("checkbox", { name: "Universities" }).check();
  await page
    .getByLabel("Certification Details (Optional)")
    .fill("ISO 9001 Certified");

  const fileChooserPromise1 = page.waitForEvent("filechooser");
  await page.click("(//div[@role='presentation'])[1]");
  const fileChooser1 = await fileChooserPromise1;
  await fileChooser1.setFiles("tests/resources/Kumar Basnet - Resume QA.pdf");

  const fileChooserPromise2 = page.waitForEvent("filechooser");
  await page.click("(//div[@role='presentation'])[2]");
  const fileChooser2 = await fileChooserPromise2;
  await fileChooser2.setFiles("tests/resources/Kumar Basnet - Resume QA.pdf");

  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForTimeout(10000);
  
   await expect(page).toHaveURL(/profile/);
});

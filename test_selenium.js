const { Builder } = require("selenium-webdriver");

async function testDriver() {
    let driver = await new Builder().forBrowser("chrome").build();
    await driver.get("https://www.google.com");
    console.log("ChromeDriver is working!");
    await driver.quit();
}

testDriver();

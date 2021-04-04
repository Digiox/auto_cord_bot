const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer')
const { response } = require('express')
app.use(cors())
app.use(bodyParser.json());


var browser;
app.post('/start', (req, res) => {
    console.log(req.body)
    const email = req.body.mail
    const pass = req.body.pass

    console.log(`Connected with email: ${email}`)

    const start = async () => {
        
        


        
        //launch browser
        browser = await puppeteer.launch({
            headless: true
        });

        //open page et set viewport size
        var page = await browser.newPage();
        page.viewport({ width: 1920 / 2, height: 1080 / 2 });

        //events

        page.on('response',async r => {
            console.log('response')
           r.json().then(data => {
               if (data.code === 50035) {
                   console.log("bad credientials")
                //    page.close().then(() => console.log('page closed'))
                //    .catch(err => console.error(err))
                    browser.close().then(() => console.log("browser closed"))
                   .catch(err => console.error(err))
                   res.status(400).send("bad_creds")
                   
               }
           })
           .catch(err => console.log('error'))
            // if (r.code === 50035) {
            //     res.status(400).send('bad_creds')    
            // }
        })

        //trying to go on the channel
        await page.goto("https://discord.com/channels/681770400715505700/688886203386298384");

        //Because the creds is never saved in the browser we try to connect
        const emailInput = await page.$('input[name="email"]')
        const passwordInput = await page.$('input[name="password"]')
        await emailInput.type(email)
        await passwordInput.type(pass)
        const submitButton = await page.$('button[type="submit"]')
        await submitButton.click()

        // await page.waitForTimeout(2000)
        
        
        console.log('test')
        await page.waitForTimeout(10000)
        const textbox = await page.$('div[aria-label="Envoyer un message à #spam⇝"]')
        res.status(200).send('success')
        await textbox.type('$bump')
        await page.keyboard.press('Enter')

        const bump = async () => {
            await page.waitForTimeout(7200000).then(async () => {
                console.log('BUMPING')
                const textbox = await page.$('div[aria-label="Envoyer un message à #spam⇝"]')
                await textbox.type('$bump')
                await page.keyboard.press('Enter')
                
            })

            return bump()
        }

        await bump()


    }
    start()

    
})

app.get('/stop',async (req, res) => {

    await browser.close().then(() => {
        console.log('browser closed')
        res.status(200).send('Browser closed')
    })
    .catch((err) => console.error(err))
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
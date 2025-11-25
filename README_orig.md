## Delivro Task

### Context

Our Delivro accounting team came to you with a request: to help them keep track of invoices related to each shipment. When our clients create shipments, it goes through our carrier partners (FedEx, UPS, GLS, etc.) and we receive invoices for the created shipments from each of these carriers. Our accounting team has no system to keep track of the invoices, and would like to be able to upload the invoice data directly to our system, so that we can match it with the shipments.

However, the carriers will sometimes send incorrect invoices as well! The weight or price could be wrong, in which case our accounting team notices and reports this issue to the carrier. When we receive a corrected invoice it is yet again uploaded for the same Shipment ID / Tracking Number and it is expected that the application will update the shipment with the latest invoice data.

### The Task

Create a dashboard that will display all the shipments uploaded to the application so far and allow the user to insert new data by uploading JSON files containing invoice data. The file upload flow within the application should be as follows:

1. User selects a JSON file (e.g. the provided example file `invoices_1.json`) containing invoice and shipment data.
2. The application will allow the user to preview the data from the JSON file _in a table (you can use TanStack Table or any equivalent)**(\*)**_ before they confirm the upload.
3. Invoice data gets uploaded to the backend and stored in the database in a format of your choosing.
4. The main shipment dashboard will now display all the latest data, including data from the newly uploaded file.

It is possible that multiple JSON files will contain invoice information related to the same shipment, in which case you should keep history of all the invoiced prices for that shipment. The dashboard should mainly display the very last price that got uploaded, but there should be some way to view shipment's price history.

**IMPORTANT:** You can assume that objects within the JSON file with the same `id` field will always contain the same exact data. For example, if you have already encountered a shipment with the same `id`, all the other fields (e.g. `trackingNumber`, `provider`, `mode`, etc.) will contain the exact same information as last time.

### User Stories

- User should be able to upload any of the `invoices_X.json` files
- User should be able to preview data from the JSON file _using a table UI**(\*)**_ before submitting it
- User should be able to view uploaded data though the shipment dashboard
- User should be able to filter the dashboard to only view shipment's made by a specific company

**Changes: (\*)** if you have started working on this task before 19.11.2025, then you do not have to implement the table UI as this was updated on this date.

### Important

- This application is assumed to be entirely internal and thus, you do NOT have to create any mechanism of authentication
- Application should be able to process and display large quantities of data without significant performance issues
- You can OPTIONALLY use wireframes found in the `/wireframes` folder for inspiration, but you are strongly encouraged to come up with your own UI/UX ideas
- You can use any database you are familiar with, but we do recommend the usage of relational DBs
- You MUST use any React-based solution to create the frontend
- You MUST use TypeScript on the Frontend and the Backend
- You MUST provide clear instructions on how to install and run the application
- If your UI design requires the use of icons, feel free to use any source that falls under an open-source license _(Lucide, Font Awesome, Heroicons, etc.)_

The **choice of frameworks and libraries does not matter** to us besides these conditions.

### Bonus ideas (completely optional)

1. Implement a Docker container to run the app
2. Deploy the application to any infrastructure provider of your choice
3. Implement i18n (English and any other language of your choice)

### Final remarks

We do not penalize the usage of AI at all. You can complete this task anyhow you want. With that being said, we do strongly care about the result, and if the project is simply an AI generated slop without any post processing input from your side then your submission will not be a very strong contender. We will follow up with a code review call where you will have an opportunity to explain all of your stack choices and why you have implemented the task in your own way.

### Task Submission

Please push your work to a new PUBLIC repository on your Github or Gitlab profile and share the link to the repository with us. If you have deployed the app anywhere (Vercel, Netlify, etc.) then please share the url link to the deployment with us too.

import fs from "fs";

const csv = `incident_id,timestamp,repo,file,line,error_name,error_message,top_frame,owners_top3,commit_list,slack_text
a3b2c1d0-1111-2222-3333-444455556666,2026-01-31T17:18:02Z,ichack26/broken_app,src/routes/api.js,17,TypeError,"Cannot read properties of undefined (reading 'id')","src/routes/api.js:17","John:95|Michael:2|Vincent:2","87123b7:install dot.env@Shawn;58eef9a:set up npm run test@Shawn;310342a:Add GitHub API integration@Angela","Crash Reason: TypeError reading 'id' at src/routes/api.js:17."
b4c3d2e1-aaaa-bbbb-cccc-ddddeeeeffff,2026-01-31T17:22:41Z,ichack26/broken_app,src/services/payments.js,25,ReferenceError,"token is not defined","src/services/payments.js:25","Angela:60|Shawn:25|Vincent:15","1e9a8da:add slack dependency@Vincent;cb4a606:add slack service@Angela","Crash Reason: ReferenceError token not defined in payments flow."
`;

fs.writeFileSync("C:\\Users\\ispas\\OneDrive\\Desktop\\School\\Imperial\\IC_Hack\\ichack26\\src\\servicesincidents.csv", csv, "utf8");
console.log("Wrote incidents.csv");
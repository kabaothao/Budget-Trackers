//TODO: setup database
let db;
let budget;
//1 means it is Version 1. It is saying it is a version for what it needs to be store.
// create a new db request for a "Budget" database.

const request = indexedDB.open("budget", budget || 30);

request.onupgradeneeded = function (e) {
  console.log("Upgrade needed in IndexDB");

  const { oldVersion } = e;

  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("budget", { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log("check db invoked");

  // Open a transaction on your budget db

  let transaction = db.transaction(["budget"], "readwrite");

  // access your budget object

  const store = transaction.objectStore("budget");

  // Get all records from store and set to a variable

  const getAll = store.getAll();

  // If the request was successful

  getAll.onsuccess = function () {
    // If there are items in the store, we need to bulk add them when we are back online

    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",

        body: JSON.stringify(getAll.result),

        headers: {
          Accept: "application/json, text/plain, */*",

          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())

        .then((res) => {
          // If our returned response is not empty

          if (res.length !== 0) {
            // Open another transaction to BudgetStore with the ability to read and write

            transaction = db.transaction(["budget"], "readwrite");

            // Assign the current store to a variable

            const currentStore = transaction.objectStore("budget");

            // Clear existing entries because our bulk add was successful

            currentStore.clear();

            console.log("Clearing store 🧹");
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log("success");

  db = e.target.result;

  // Check if app is online before reading from db

  if (navigator.onLine) {
    console.log("Backend online! 🗄️");

    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log("Save record invoked");

  // Create a transaction on the budget db with readwrite access

  const transaction = db.transaction(["budget"], "readwrite");

  // Access your budget object store

  const store = transaction.objectStore("budget");

  // Add record to your store with add method.

  store.add(record);
};

// Listen for app coming back online

window.addEventListener("online", checkDatabase);

// -------------------------------------

// const request = indexedDB.open("budget", 1);

// request.onupgradeneeded = function (event) {
//   // create object store called "BudgetStore" and set autoIncrement to true
//   const db = event.target.result;
//   db.createObjectStore("BudgetStore", { autoIncrement: true });
// };

// request.onsuccess = function (event) {
//   console.log("success");
//   db = event.target.result;
//   //set up to check if app is online before reading from db
//   if (navigator.onLine) {
//     console.log("Backend online is working!");
//     checkDatabase();
//   }
// };

// request.onerror = function (event) {
//   // log error here
//   console.log(`Woops! ${e.target.errorCode}`);
// };

// const saveRecord = (record) => {
//   console.log("Save record invoked");
//   // Create a transaction on the BudgetStore db with readwrite access
//   const transaction = db.transaction(["BudgetStore"], "readwrite");

//   // Access your BudgetStore object store
//   const store = transaction.objectStore("BudgetStore");

//   // Add record to your store with add method.
//   store.add(record);
// };

// function checkDatabase() {
//   // open a transaction on your pending db
//   let transaction = db.transaction(["BudgetStore"], "readwrite");
//   // access your pending object store
//   const store = transaction.objectStore("BudgetStore");
//   // get all records from store and set to a variable
//   const getAll = store.getAll();

//   // If the request was successful
//   getAll.onsuccess = function () {
//     // If there are items in the store, we need to bulk add them when we are back online
//     if (getAll.result.length > 0) {
//       fetch("/api/transaction/bulk", {
//         method: "POST",
//         body: JSON.stringify(getAll.result),
//         headers: {
//           Accept: "application/json, text/plain, */*",
//           "Content-Type": "application/json",
//         },
//       })
//         .then((response) => response.json())
//         .then((res) => {
//           // If our returned response is not empty
//           if (res.length !== 0) {
//             // Open another transaction to BudgetStore with the ability to read and write
//             transaction = db.transaction(["BudgetStore"], "readwrite");

//             // Assign the current store to a variable
//             const currentStore = transaction.objectStore("BudgetStore");

//             // Clear existing entries because our bulk add was successful
//             currentStore.clear();
//             console.log("Clearing store 🧹");
//           }
//         });
//     }
//   };
// }

// //listen for app coming back online
// window.addEventListener("online", checkDatabase);

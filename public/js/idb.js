// create variable to hold db connection
let db;

//creates db instance
const request = indexedDB.open('budget-trackers', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// message upon error with idbDatabase
request.onerror = function (event) {
    console.log(`Error with idbDatebase: ${event.target.errorCode}`);
};

// upon a successful req
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
};

//saveRecord function is executed if attempt is made to submit a new transaction AND there is no internet connection
function saveRecord(record) {
    //opens new transaction with db with both read and write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    //access object store
    const budgetStore = transaction.objectStore('new_transaction');

    //adds record to the budget store 
    budgetStore.add(record);
};

function uploadTransaction() {

    //opens a new transaction on db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //access our object store
    const budgetStore = transaction.objectStore('new_transaction');

    //gets all records from store 
    const getAll = budgetStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('api/transaction', {
                method: POST,
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error (serverResponse);
                }

                //open one more transaction
                const transaction = db.transaction(['new_transaction'], 'readwrite');

                //access new budget transaction store
                const budgetStore = transaction.objectStore('new_transaction');

                //clear all items in the store
                budgetStore.clear();

                alert('All saved transaction have been submitted!');

            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};
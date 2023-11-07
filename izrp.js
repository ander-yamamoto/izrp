
// this will be the PouchDB database
var db = new PouchDB('izrp');

// template animal list object
const sampleAnimalList = {
  "_id": "",
  "type": "list",
  "version": 1,
  "tag": 0,
  "name": "",
  "bornAt": "",
  "diedAt": "",
  "alive": true,
  "group": null,
  "batch": null,
  "stall": 1,
  "createdAt": "",
  "createdBy": "",
  "updatedAt": "",
  "updatedBy": ""
};

// template animal list score object
const sampleAnimalScore = {
  "_id": "",
  "type": "score",
  "version": 1,
  "tag": 0,
  "scoreFecal": 1,
  "scoreNose": 2,
  "scoreEar": 3,
  "scoreEye": 4,
  "temperature": 0.0,
  "treatment": "",
  "createdAt": "",
  "createdBy": "",
  "updatedAt": "",
  "updatedBy": ""
};

// template batch list object
const sampleBatch = {
  "_id": "",
  "type": "batch",
  "version": 1,
  "farm": "",
  "arrivalDate": "",
  "createdAt": "",
};



/**
 * Sort comparison function to sort an object by "TAG" field
 *
 * @param  {String} a
 * @param  {String} b
 * @returns {Number}
 */
const sortTag = (a, b) => {
  if (a.tag < b.tag) return -1;
  if (a.tag > b.tag) return 1;
  return 0
}


/**
 * Sort comparison function to sort an object by "createdAt" field
 *
 * @param  {String} a
 * @param  {String} b
 * @returns {Number}
 */
const newestFirst = (a, b) => {
  if (a.createdAt > b.createdAt) return -1;
  if (a.createdAt < b.createdAt) return 1;
  return 0
};



/**
 * Perform an "AJAX" request i.e call the URL supplied with the 
 * a querystring constructed from the supplied object
 *
 * @param  {String} url 
 * @param  {Object} querystring 
 * @returns {Promise}
 */
const ajax = function (url, querystring) {
  return new Promise(function (resolve, reject) {

    // construct URL
    var qs = [];
    for (var i in querystring) { qs.push(i + '=' + encodeURIComponent(querystring[i])) }
    url = url + '?' + qs.join('&');

    // make HTTP GET request
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          var obj = JSON.parse(xmlhttp.responseText);
          resolve(obj);
        } else {
          reject(null);
        }
      }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  });
};

var app = new Vue({
  el: '#app',
  data: {
    mode: 'showlist',
    pagetitle: 'IZ-RP',
    animalList: [],
    animalScoreList: [],
    batchList: [],
    singleBatch: null,
    farmList: [],
    treatmentList: [],
    newFarm: '',
    newTreat: '',
    user: '',
    singleAnimal: null,
    singleScore: null,
    currentAnimalId: null,
    newItemTitle: '',
    selectedPlace: null,
    selectBatch: null,
    selectFarm: null,
    selectTreat: null,
    syncURL: '',
    syncStatus: 'notsyncing',
    debug: null,
    error: null,
    selected: 0,
    selected1: 0,
    selected2: 0,
    selected3: 0,
  },
  computed: {
    /**
     * Calculates the animal list but sorted into
     * tag order
     * 
     * @returns {Array}
     */
    sortedAnimalList: function () {
      
      return this.animalList.sort(sortTag);
    },

    /**
     * Calculates the animal list but sorted by 
     * tag order
     * 
     * @returns {Array}
     */
    sortedAnimalListPending: function () {
      let list = [];
      let pending = this.animalScoreList.filter(function (bydate) { return (bydate.treatment == (new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0') + "-" + String(new Date().getDate()).padStart(2, '0'))); });
      for (let i = 0; i < this.animalList.length; i++) {
        var aux = 0;
        for (let j = 0; j < pending.length; j++) {
          if (pending[j].tag == this.animalList[i].tag) {
            aux += 1;
          }
        }
        if (aux == 0) list.push(this.animalList[i]);
      }

      if (this.selected == 0) return list.sort(sortTag);
      else if (this.selected == 1) {
        if (this.selected1 == 0) return list.filter(function (piquete) { return piquete.stall == 1; }).sort(sortTag);
        else return list.filter(function (piquete) { return piquete.stall == 2; }).sort(sortTag);
      }
      else {
        if (this.selected2 == 0){
          if (this.selected3 == 0) return list.filter(function (treat) { return treat.group == "zinco"; }).filter(function (piquete1) { return piquete1.stall == 1; }).sort(sortTag);
          else return list.filter(function (treat) { return treat.group == "zinco"; }).filter(function (piquete) { return piquete.stall == 2; }).sort(sortTag);
        }
        else{
          if (this.selected3 == 0) return list.filter(function (treat) { return treat.group == "placebo"; }).filter(function (piquete1) { return piquete1.stall == 1; }).sort(sortTag);
          else return list.filter(function (treat) { return treat.group == "placebo"; }).filter(function (piquete) { return piquete.stall == 2; }).sort(sortTag);
        }
      }

    },
        /**
     * Calculates the animal list but sorted by 
     * tag order
     * 
     * @returns {Array}
     */
    sortedAnimalListOk: function () {

      let list = [];
      let ok = this.animalScoreList.filter(function (bydate) { return (bydate.treatment == (new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0') + "-" + String(new Date().getDate()).padStart(2, '0'))); });
      for (let i = 0; i < this.animalList.length; i++) {
        var aux = 0;
        for (let j = 0; j < ok.length; j++) {
          if (ok[j].tag == this.animalList[i].tag) {
            aux += 1;
          }
        }
        if (aux != 0) list.push(this.animalList[i]);

      }
      if (this.selected == 0) return list.sort(sortTag);
      else if (this.selected == 1) {
        if (this.selected1 == 0) return list.filter(function (piquete) { return piquete.stall == 1; }).sort(sortTag);
        else return list.filter(function (piquete) { return piquete.stall == 2; }).sort(sortTag);
      }
      else {
        if (this.selected2 == 0){
          if (this.selected3 == 0) return list.filter(function (treat) { return treat.group == "zinco"; }).filter(function (piquete1) { return piquete1.stall == 1; }).sort(sortTag);
          else return list.filter(function (treat) { return treat.group == "zinco"; }).filter(function (piquete) { return piquete.stall == 2; }).sort(sortTag);
        }
        else{
          if (this.selected3 == 0) return list.filter(function (treat) { return treat.group == "placebo"; }).filter(function (piquete1) { return piquete1.stall == 1; }).sort(sortTag);
          else return list.filter(function (treat) { return treat.group == "placebo"; }).filter(function (piquete) { return piquete.stall == 2; }).sort(sortTag);
        }
      }

    },

    /**
     * Calculates the Animal Score items but sorted into
     * date order - newest first
     * 
     * @returns {Array}
     */
    sortedAnimalScoreList: function () {
      return this.animalScoreList.sort(newestFirst);
    },

    /**
     * Given a list of docs and a tag, find the doc in the list that has
     * an 'tag' that matches the incoming tag.
     * Returns true if found

    * @returns {Boolean}
    */
    validateTag: function () {
      var valid = true;
      var edit = false;

      for (var i in this.animalList) {
        if (this.animalList[i]._id == this.singleAnimal._id) {
          edit = true;
        }
      }
      if (typeof (this.singleAnimal.tag) != "number") valid = false;

      if (this.singleAnimal.tag < 1) valid = false;
      if (!edit) {
        for (var i in this.animalList) {
          if (this.animalList[i].tag == this.singleAnimal.tag) {
            valid = false;
          }
        }
      }

      return (valid);
    },
    /**
     * Given a list of docs and a tag, find the doc in the list that has
     * an 'tag' that matches the incoming tag.
     * Returns true if found

    * @returns {Boolean}
    */
    isEdit: function () {
      for (var i in this.animalList) {
        if (this.animalList[i]._id == this.singleAnimal._id) {
          return true;
        }
      }
      return false;
    },
  },
  /**
   * Called once when the app is first loaded
   */
  created: function () {

    // create database index on 'type'
    db.createIndex({ index: { fields: ['type'] } }).then(() => {

      // load all 'list' items 
      var q = {
        selector: {
          type: 'list'
        }
      };
      return db.find(q);
    }).then((data) => {

      // write the data to the Vue model, and from there the web page
      app.animalList = data.docs;

      // get all of the animal list items
      var q = {
        selector: {
          type: 'score'
        }
      };
      return db.find(q);
    }).then((data) => {
      // write the score list  to the Vue model
      app.animalScoreList = data.docs;

      var q = {
        selector: {
          type: 'batch'
        }
      };
      return db.find(q);
    }).then((data) => {
      // write the batch list to the Vue model
      app.batchList = data.docs;
      this.populateLists();

      return db.get('_local/user');
    }).then((data) => {
      // if we have settings, start syncing
      this.syncURL = data.syncURL;
      this.user = data.user;
      this.startSync();
    }).catch((e) => { });



  },
  methods: {
    /**
     * Called when the settings button is pressed. Sets the mode
     * to 'settings' so the Vue displays the settings panel.
     */
    onClickSettings: function () {
      this.mode = 'settings';
      this.pagetitle = 'Config';
    },
    /**
 * Called when the about button is pressed. Sets the mode
 * to 'about' so the Vue displays the about panel.
 */
    onClickEditList: function () {
      this.mode = 'editlist';
    },
    /**
     * Called when the about button is pressed. Sets the mode
     * to 'about' so the Vue displays the about panel.
     */
    onClickAbout: function () {
      this.mode = 'about';
    },
    /**
     * Saves 'doc' to PouchDB. It first checks whether that doc
     * exists in the database. If it does, it overwrites it - if
     * it doesn't, it just writes it. 
     * @param {Object} doc
     * @returns {Promise}
     */
    saveLocalDoc: function (doc) {
      return db.get(doc._id).then((data) => {
        doc._rev = data._rev;
        return db.put(doc);
      }).catch((e) => {
        return db.put(doc);
      });
    },
    /**
     * Called when save button on the settings panel is clicked. The
     * Cloudant sync URL is saved in PouchDB and the sync process starts.
     */
    onClickStartSync: function () {

      alert(JSON.stringify(this.form))
      var obj = {
        '_id': '_local/user',
        'syncURL': this.syncURL,
        'user': this.user,
      };
      this.saveLocalDoc(obj).then(() => {
        this.startSync();
      });
    },

    /**
     * Called when the sync process is to start. Initiates a PouchDB to
     * to Cloudant two-way sync and listens to the changes coming in
     * from the Cloudant feed. We need to monitor the incoming change
     * so that the Vue.js model is kept in sync.
     */
    startSync: function () {
      this.syncStatus = 'notsyncing';
      if (this.sync) {
        this.sync.cancel();
        this.sync = null;
      }
      if (!this.syncURL) { return; }
      this.syncStatus = 'syncing';
      this.sync = db.sync(this.syncURL, {
        live: true,
        retry: false
      }).on('change', (info) => {
        // handle change
        // if this is an incoming change
        if (info.direction == 'pull' && info.change && info.change.docs) {

          // loop through all the changes
          for (var i in info.change.docs) {
            var change = info.change.docs[i];
            var arr = null;

            // see if it's an incoming item or list or something else
            if (change._id.match(/^score/)) {
              arr = this.animalScoreList;
            } else if (change._id.match(/^list/)) {
              arr = this.animalList;
            } else {
              continue;
            }

            // locate the doc in our existing arrays
            var match = this.findDoc(arr, change._id);

            // if we have it already 
            if (match.doc) {
              // and it's a deletion
              if (change._deleted == true) {
                // remove it
                arr.splice(match.i, 1);
              } else {
                // modify it
                delete change._revisions;
                Vue.set(arr, match.i, change);
              }
            } else {
              // add it
              if (!change._deleted) {
                arr.unshift(change);
              }
            }
          }
        }
      }).on('error', (e) => {
        this.syncStatus = 'syncerror';
      }).on('denied', (e) => {
        this.syncStatus = 'syncerror';
      }).on('paused', (e) => {
        if (e) {
          this.syncStatus = 'syncerror';
        }
      });;
    },


    /**
     * Given a list of docs and an id, find the doc in the list that has
     * an '_id' (key) that matches the incoming id. Returns an object 
     * with the 
     *   i - the index where the item was found
     *   doc - the matching document
     * @param {Array} docs
     * @param {String} id
     * @param {String} key
     * @returns {Object}
     */
    findDoc: function (docs, id, key) {
      if (!key) {
        key = '_id';
      }
      var doc = null;
      for (var i in docs) {
        if (docs[i][key] == id) {
          doc = docs[i];
          break;
        }
      }
      return { i: i, doc: doc };
    },



    /**
     * Given a list of docs and an id, find the doc in the list that has
     * an '_id' (key) that matches the incoming id. Updates its "updatedAt"
     * attribute and write it back to PouchDB.
     *   i - the index where the item was found
     *   doc - the matching document
     * @param {Array} docs
     * @param {String} id

     */
    findUpdateDoc: function (docs, id) {

      // locate the doc
      var doc = this.findDoc(docs, id).doc;

      // if it exits
      if (doc) {

        // modift the updated date
        doc.updatedAt = new Date().toISOString();

        // write it on the next tick (to give Vue.js chance to sync state)
        this.$nextTick(() => {

          // write to database
          db.put(doc).then((data) => {

            // retain the revision token
            doc._rev = data.rev;
          });
        });
      }
    },

    /**
     * Called when the user clicks the Add Animal button. Sets
     * the mode to 'addlist' to reveal the add animal list form and
     * resets the form variables.
     */
    onClickAddAnimal: function () {

      // open animal list form

      this.pagetitle = 'Cadastar Animal';
      this.mode = 'addlist';
      this.singleAnimal = JSON.parse(JSON.stringify(sampleAnimalList));
      this.singleBatch = JSON.parse(JSON.stringify(sampleBatch));
      this.singleAnimal._id = 'list:' + cuid();
      this.singleAnimal.createdAt = new Date().toISOString();
      this.singleAnimal.createdBy = this.user;
      this.newFarm = "";
      this.selectFarm = null;
    },

    populateLists: function () {
      var list = [];
      for (const element of this.batchList) {
        list.push(element.farm);
      }
      this.farmList = list.filter((value, index, array) => array.indexOf(value) === index);
      list = [];
      for (const element of this.animalList) {
        list.push(element.group);
      }
      this.treatmentList = list.filter((value, index, array) => array.indexOf(value) === index);

    },



    /**
     * Called when the Save Animal List button is pressed.
     * Writes the new list to PouchDB and adds it to the Vue 
     * model's animalScoreList array
     */
    onClickSaveAnimal: function () {


      // add timestamps
      this.singleAnimal.updatedAt = new Date().toISOString();
      this.singleAnimal.updatedBy = this.user;
      if (this.validateSave()) {
        if (this.selectTreat == -1) {

          this.treatmentList.push(this.newTreat);
          this.singleAnimal.group = this.newTreat;
        }
        else {
          this.singleAnimal.group = this.treatmentList[this.selectTreat];
        }
        if (this.selectBatch == -1) {
          this.singleBatch._id = 'batch:' + cuid();
          this.singleBatch.createdAt = new Date().toISOString();
          this.singleBatch.updatedAt = new Date().toISOString();
          if (this.selectFarm == -1) {

            this.farmList.push(this.newFarm);
            this.singleBatch.farm = this.newFarm;
          }
          else {
            this.singleBatch.farm = this.farmList[this.selectFarm];
          }

          if (typeof this.singleBatch._rev === 'undefined') {
            this.batchList.push(this.singleBatch);
          }
          this.singleAnimal.batch = (this.batchList.length - 1);
          db.put(this.singleBatch).then((data) => {
            // keep the revision tokens
            this.singleBatch._rev = data.rev;
          });

        }
        else {
          this.singleAnimal.batch = this.selectBatch;
        }
        // add to on-screen list, if it's not there already
        if (typeof this.singleAnimal._rev === 'undefined') {
          this.animalList.unshift(this.singleAnimal);
        }

        // write to database
        db.put(this.singleAnimal).then((data) => {
          // keep the revision tokens
          this.singleAnimal._rev = data.rev;

          // switch mode
          this.onBack();
        });
      }
    },


    /**
     * Called when the Save Animal List button is pressed.
     * Writes the new list to PouchDB and adds it to the Vue 
     * model's animalScoreList array
     * @param {String} id
     * @param {Number} tag
     */
    onClickTreatAnimal: function (id, tag) {

      if (confirm("Confirmação de tratamento!") == true) {
        
        let test = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0') + "-" + String(new Date().getDate()).padStart(2, '0');
        let test2 = this.animalScoreList.filter(function (bydate) { return (bydate.treatment == test)}).filter(function (bytag) {bytag.tag == tag}).length;

          if (test2==0)  {
              this.singleScore = JSON.parse(JSON.stringify(sampleAnimalScore));
              this.singleScore._id = 'score:' + cuid();
              this.singleScore.tag = tag;
              this.singleScore.scoreFecal = null;
              this.singleScore.scoreNose = null;
              this.singleScore.scoreEar = null;
              this.singleScore.scoreEye = null;
              this.singleScore.temperature = null;
              this.singleScore.createdAt = new Date().toISOString();
              this.singleScore.createdBy = this.user;
              this.singleScore.updatedAt = new Date().toISOString();
              this.singleScore.updatedBy = this.user;
              this.singleScore.treatment = new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, '0') + "-" + String(new Date().getDate()).padStart(2, '0');



              // add to on-screen list, if it's not there already
              if (typeof this.singleScore._rev === 'undefined') {
                this.animalScoreList.unshift(this.singleScore);
              }

              // write to database
              db.put(this.singleScore).then((data) => {
                // keep the revision tokens
                this.singleScore._rev = data.rev;

              });
            }
      }

    },


    validateSave: function () {
      var edit = false;
      var valid = true;
      var track = 0;
      for (var i in this.animalList) {
        if (this.animalList[i]._id == this.singleAnimal._id) {
          edit = true;
        }
      }
      if (typeof (this.singleAnimal.tag) != "number") { valid = false; track += 1; }
      if (this.singleAnimal.tag < 1) { valid = false; track += 2; }
      if (edit == false) {
        for (var i in this.animalList) {
          if (this.animalList[i].tag == this.singleAnimal.tag) {
            valid == false; track += 4;
          }
        }
      }
      if (this.singleAnimal.name == "" || this.singleAnimal.name == null) { valid = false; track += 8; }
      if (this.singleAnimal.bornAt == "" || this.singleAnimal.bornAt == null) { valid = false; track += 16; }
      if (this.singleAnimal.name == "") { valid = false; track += 32; }
      if (this.singleAnimal.batch == -1) {
        if (this.singleBatch.farm == null || (this.singleBatch.farm == -1 && this.newFarm == "")) { valid = false; track += 64; }
        if (this.singleBatch.arrivalDate == "" || this.singleBatch.arrivalDate == null) { valid = false; track += 128; }
      }

      return (valid);

    },

    /**
     * Called when the Back button is pressed. Returns to the
     * home screen with a lit of animal list.
     */
    onBack: function () {
      if (this.mode == 'editanimal' || this.mode == 'addlist') this.mode = 'editlist';
      else this.mode = 'showlist';
      this.pagetitle = 'IZ-RP';
    },


    /**
    * Called when the home button is pressed. Returns to the
    * home screen with a lit of animal list.
    */
    onClickHome: function () {
      this.mode = 'showlist';
      this.pagetitle = 'IZ-RP';
    },

    /**
     * Called when the Edit button is pressed next to a animal list.
     * We locate the list document by id and change mode to "addlist",
     * pre-filling the form with that document's details.
     * @param {String} id
     * @param {Number} tag
     */
    onClickEdit: function (id, tag) {


      this.singleAnimal = this.findDoc(this.animalList, id).doc;
      this.singleBatch = this.findDoc(this.batchList, this.singleAnimal.batch, id).doc;
      this.selectBatch = this.singleAnimal.batch;
      this.selectTreat = this.treatmentList.indexOf(this.singleAnimal.group);
      this.selectFarm = null;
      this.pagetitle = "Edit " + this.printTag(tag);
      this.mode = 'editanimal';


    },

    /**
     * Called when the delete button is pressed next to a animal list.
     * The shopping list document is located, removed from PouchDB and
     * removed from Vue's animalScoreList array.
     * @param {String} id
     */
    onClickDelete: function (id) {
      var match = this.findDoc(this.animalList, id);
      db.remove(match.doc).then(() => {
        this.animalList.splice(match.i, 1);
      });
    },

    // the user wants to see the contents of a animal list
    // we load it and switch views
    /**
     * Called when the user wants to edit the contents of a animal list.
     * The mode is set to 'itemedit'. Vue's currentListId is set to this list's
     * id field.
     * @param {String} id
     * @param {Number} tag
     */
    onClickTag: function (id, tag) {
      this.currentAnimalId = tag;
      this.pagetitle = "Manejo " + this.printTag(tag);
      this.mode = 'itemedit';
    },

    /**
     * Called when a new animal list item is added. A new animal list item
     * object is created with a unique id. It is written to PouchDB and added
     * to Vue's animalScoreList array
     */

    onAddListItem: function () {
      if (!this.newItemTitle) return;
      var obj = JSON.parse(JSON.stringify(sampleAnimalScore));
      obj._id = 'item:' + cuid();
      obj.title = this.newItemTitle;
      obj.tag = this.currentAnimalId;
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      db.put(obj).then((data) => {
        obj._rev = data.rev;
        this.animalScoreList.unshift(obj);
        this.newItemTitle = '';
      });
    },




    /**
     * Called when an item is deleted from a animal list. We locate the item
     * in the list, delete it from PouchDB and remove it from the animalScoreList
     * Vue array.
     * @param {String} id
     */
    onDeleteItem: function (id) {
      var match = this.findDoc(this.animalScoreList, id);
      db.remove(match.doc).then((data) => {
        this.animalScoreList.splice(match.i, 1);
      });
    },

    /**
     * Calculates days difference
     * @param {String} born
     * @returns {Number}
     */
    diffDays: function (born) {
      /*
      const bornAt = Math.floor(((new Date(born)/ 3600000)+4)/24);
      const now = Math.floor(new Date() / (24 * 3600000));
      return (now - bornAt); */
      const bornAt = Math.floor((new Date(born)/3600000)+(new Date().getTimezoneOffset()/60));
      const now = Math.floor(new Date() / (3600000));
      return (Math.floor((now - bornAt)/24));
      
    },

    /**
     * Calculates days difference
     * @param {String} born
     * @returns {Number}
     */
    dosage: function (born) {
      const bornAt = Math.floor(new Date(born) / (24 * 3600000));
      const now = Math.floor(new Date() / (24 * 3600000));
      if ((now - bornAt)>=53) return "Dose 3";
      else if ((now - bornAt)>=49) return "Dose 2";
      else return "Dose 1";
    },

    /**
     * @param {Number} tag
     * @returns {String}
     */
    printTag: function (tag) {
      let a = ('0000' + tag).slice(-4);
      return (a);
    }
  }
})
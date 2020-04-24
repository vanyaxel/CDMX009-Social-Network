let googleP = new firebase.auth.GoogleAuthProvider();
let facebookP = new firebase.auth.FacebookAuthProvider();
let db = firebase.firestore();
// Firebase init
/* firebase.storage(); */

//Log up email
$('#email-submit').click(function () {
  let emailUser = document.querySelector('#email-new').value;
  let passwordUser = document.querySelector('#password-new').value;
  console.log(emailUser, passwordUser);

  firebase.auth().createUserWithEmailAndPassword(emailUser, passwordUser)
    .catch(function (error) {
      // Errors
      var errorMessage = error.message;
      console.log(errorMessage)
      if (errorMessage) {
        let invalidEmail = document.querySelector('#invalid-email')
        invalidEmail.innerHTML = errorMessage
      }
    });
});

function emailLogin() {
  let emailUser = document.querySelector('#email-login').value;
  let passwordUser = document.querySelector('#password-login').value;
  let emailError = document.querySelector('#email-error');
  console.log(emailUser, passwordUser)
  firebase.auth().signInWithEmailAndPassword(emailUser, passwordUser).catch(function(error) {
  //Error
  var errorMessage = error.message;
  emailError.innerHTML = errorMessage,
  console.log(errorMessage)
});
}


function loginFb () {
  firebase.auth().signInWithRedirect(facebookP)
  .then(function(result){
    console.log(result);
  })
}

function loginGoogle(){
  firebase.auth().signInWithRedirect(googleP)
  .then(function(result) {
    console.log(result)
    //console.log(result.user);
    /* saveDataUser(result.user);
    if (result.user.emailVerified){
      window.open('#/','_self')
    } */
  });
}

//Observator 

function observatorFirebase () {
  firebase.auth().onAuthStateChanged(function(user){
    let menu = document.querySelector('.menu')
    if (user) {
        render();
        displayName = user.displayName;
        photoURL = user.photoURL;
        localStorage.setItem('nameStorage', displayName);
        localStorage.setItem('URLStorage', photoURL);
        window.open('#/home', '_self');
        menu.classList.remove('hide');
        console.log('estas activo dude :)', user);
    }
     else {
      console.log('no estas activo chavo :(')
    }
  })
}
observatorFirebase();

//Nodes
let photoURL
let displayName


//Initialize Cloud Firestore through Firebase
  let st = firebase.storage(); 
  
  //Nodes
  let savePost = document.querySelector('#savePost');
  let url
  let day

  //Print time
  let timeSnap = () => {
    let now = new Date();
    let date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
    let time = [now.getHours(), now.getMinutes(), now.getSeconds()];
    day = date.join('/') + ' ' + time.join(':');
  }

  //Add users
  savePost.onclick = () => {
    timeSnap();
    let title = document.querySelector('#recipientTitle').value;
    let activity = document.querySelector('#recipientActivity').value;
    let location = document.querySelector('#recipientLocation').value;
    let description = document.querySelector('#recipientDescription').value;

      db.collection("newPosts").add({

        title: title,
        activity: activity,
        location: location,
        description: description,
        image: url,
        date: day,
        displayName,
        photoURL
      })
        .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
          document.querySelector('#recipientTitle').value = '';
          document.querySelector('#recipientActivity').value = '';
          document.querySelector('#recipientLocation').value = '';
          document.querySelector('#recipientDescription').value = '';
          })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
  }

//Add image

  let fileInput = document.querySelector('#file');

  fileInput.onchange = e => {
      console.log(e.target.files);
      let file = e.target.files[0]
        st.ref('img').child(file.name).put(file)
            .then(snap => {
                return snap.ref.getDownloadURL()
            })
            .then(link => {
                url = link
                let img = document.createElement('img')
                img.src = link
            })
  }
  
//Read documents

    let render = () => {
      let post = document.querySelector('#contentCreated');
      db.collection("newPosts").onSnapshot((querySnapshot) => {
        post.innerHTML = '';
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} => ${doc.data().title}`);
            post.innerHTML += `   
            <div class="container">
            <div class="card-post-container">
              <div class="card-title-post">
                <div id="postImg" class="img-post">
                  <img width="100%" src="${doc.data().image}">
                </div>
                <div class="info-over-image">
                  <h4 id="titlePost">${doc.data().title}</h4>
                  <div class="subtitle-post">
                    <p id="activityPost">${doc.data().activity}</p>
                    <p id="locationPost">${doc.data().location}</p>
                  </div>
                </div>
                <div class="" id="infoUserContainer">
                  <div class="info-user">
                    <img src="${doc.data().photoURL}">
                    <h4>${doc.data().displayName}</h4>
                  </div>
                  <span class="edit-delete-icons">
                  <i class="far fa-trash-alt js-delete" id="${doc.id}"></i>
                  <i class="fas fa-pencil-alt js-edit" onclick="editPost('${doc.id}', '${doc.data().title}','${doc.data().activity}','${doc.data().location}','${doc.data().description}')"></i>
                </span>
                    <p id="descriptionPost">${doc.data().description}</p> 
                    <p>${doc.data().date}</p>
                </div>
              </div>
            </div>
          </div>     
            `
          let deletebutton = document.querySelectorAll('.js-delete');
          let deletePost = (e) => {
            console.log(e.target.id);
            db.collection('newPosts').doc(e.target.id).delete()
              .then(function(){
                console.log('Lo borraste, eres chido');
              })
              .catch(function(error){
                console.log('No pudiste, ponte chido', error);
              });
          }
            deletebutton.forEach(btn=> btn.addEventListener('click', deletePost))
       });
     }) 
    }; 

export { loginGoogle, loginFb, emailLogin, observatorFirebase };
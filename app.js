window.onload = function(){


    // notepad variables
    const saveBtn = document.getElementById("save");
    const clearBtn = document.getElementById("clear");
    const textarea = document.getElementById("text");
    const fonts = document.querySelector(".fonts");
    const font_size= document.querySelector(".font-size");
    const bold = document.querySelector(".bold");
    const italics = document.querySelector(".italics");
    const underline = document.querySelector(".underline");
    const sign_up = document.querySelector(".sign-up");
    const sign_up_form = sign_up.children[0];
    const login = document.querySelector(".login");
    const login_form = login.children[0];
    const logged_in_options = document.querySelectorAll(".logged-in");
    const logged_out_options = document.querySelectorAll(".logged-out");
    const text_notepad = document.querySelector(".main-content");
    const body = document.querySelector("body");
    let bold_flag=0;
    let italic_flag=0;
    let underline_flag=0;

    //Paint varaibles
    const canvas= document.getElementById("canvas");
    const red = document.querySelector(".red");
    const blue = document.querySelector(".blue");
    const green = document.querySelector(".green");
    const yellow = document.querySelector(".yellow");
    const color_picker= document.querySelector(".color-picker");
    const pen= document.querySelector(".pen-range");
    const undo= document.querySelector(".undo");
    const redo= document.querySelector(".redo");
    const clear= document.querySelector(".clear");
    const save= document.querySelector(".save");
    const erase= document.querySelector(".eraser");
    const paint = document.querySelector(".paint");

    let restore_array=[];
    let index=-1;
    let first_time_flag=1;
    
    let user_name= "anonymous"
    let picTitle = "paint_image";
    let document_name ="anonymous";

    

    // Firebase details
    var firebaseConfig = {
        apiKey: "AIzaSyCCfTVgoqb1mkua-Nlcr54M7VuY078Uh2g",
        authDomain: "onlineeditor-8f754.firebaseapp.com",
        projectId: "onlineeditor-8f754",
        storageBucket: "onlineeditor-8f754.appspot.com",
        messagingSenderId: "412831599944",
        appId: "1:412831599944:web:f1334bbea4df27c8cf777d",
        measurementId: "G-3365LTLT95"
    };

    
    firebase.initializeApp(firebaseConfig);
    //console.log(firebase);
    let db = firebase.firestore();
    let storageRef = firebase.storage().ref();
    let auth = firebase.auth();
    //loadData();
    //load_image();
    //console.log("Hi Pavan");
    canvas.width= window.innerWidth - 60;;
    canvas.height= 400;
    let context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0,0,canvas.width,canvas.height);


    let draw_color= "black";
    let draw_width ="2";
    let is_drawing=false;

    red.addEventListener("click",()=>{
        draw_color="red";
    });

    blue.addEventListener("click",()=>{
        draw_color="blue";
    });

    green.addEventListener("click",()=>{
        draw_color="green";
    });

    yellow.addEventListener("click",()=>{
        draw_color="yellow";
    });
    color_picker.addEventListener("input",()=>{
        draw_color = color_picker.value;
        //console.log("onInput working");
    })
    pen.addEventListener("input",()=>{
        draw_width =  pen.value;
    })
    erase.addEventListener("click",eraser);

    canvas.addEventListener("touchstart",start,false);
    canvas.addEventListener("touchmove",draw,false);
    canvas.addEventListener("mousedown",start,false);
    canvas.addEventListener("mousemove",draw,false);

    canvas.addEventListener("mouseout",stop,false);
    canvas.addEventListener("touchend",stop,false);
    canvas.addEventListener("mouseup",stop,false);

    clear.addEventListener("click",clear_canvas);
    undo.addEventListener("click",undo_last);
    redo.addEventListener("click",redo_last);

    /* Drawing Functions to draw on canvas */
    function start(event){
        is_drawing=true;
        context.beginPath();
        context.moveTo(event.clientX-canvas.offsetLeft,
            event.clientY-canvas.offsetTop);
        event.preventDefault();
    }

    function draw(event){
        if(is_drawing){
            context.strokeStyle = draw_color;
            context.lineWidth = draw_width;
            context.lineCap = "round";
            context.lineJoin = "round";
            context.stroke();
            context.lineTo(event.clientX - canvas.offsetLeft,
                event.clientY - canvas.offsetTop);
        
        }
        event.preventDefault();
    }
    function stop(event){
        if( is_drawing){
            context.stroke();
            context.closePath();
            is_drawing = false;
        }
        if (event.type != "mouseout"){
        restore_array.push(context.getImageData(0,0,canvas.width,canvas.height));
        index+=1;
        }
        context.globalCompositeOperation = "source-over";
        event.preventDefault();
    }

    function clear_canvas(event){
        if(context){
            context.fillStyle ="white";
            context.clearRect(0,0,canvas.width, canvas.height);

        }
    }

    function eraser(event){
        if (context){
            draw_color="white";
            context.globalCompositeOperation = "destination-out"
        }
    }

    function undo_last(event){
        if(index<=0){
            clear_canvas();
        }else{
            index-=1;
            //restore_array.pop();
            context.putImageData(restore_array[index],0,0);
        }
    }

    function redo_last(event){
        if(index < restore_array.length-1){
            index+=1
            context.putImageData(restore_array[index],0,0);
        }
    }
    /* Saving data on firebase */
    save.addEventListener("click",e=>{
        
        // storing filenames on cloud firestore

        db.collection("users")
        .add({
            name: user_name,
            title: picTitle
        })
        .then(function(docRef){
            console.log("Document written with Id: ",docRef.id);
        })
        .catch(function(error){
            console.error("Error adding Document: ",error);
        })
        console.log(user_name);
        saveImage(user_name);
    });

    /* Storing Image data on storage */
    function saveImage(name){
        canvas.toBlob(function(blob){
            var image = new Image();
            image.src= blob+ '?' + new Date().getTime();;
            var metadata = {
                contentType: "image/png"
            };
            console.log(name);
            storageRef.child("images/"+ name)
            .put(blob,metadata)
            .then(function(snapshot)
            {
                console.log("Uploaded", snapshot.totalBytes,"bytes.");
            })
            .catch(function(error){
                console.error("Upload failed:", error);
            })
        });
    }

    // Function to retrieve data from firebase on the canvas
    async function load_image(){
        // retrieving the name of the file from cloud firestore
        var docRef = db.collection("users").doc("pavan_agarwal");
        //console.log(docRef)
        docRef
        .get()
        .then((doc) =>{
            console.log(doc);
            let name = doc.data().name;
            let title= doc.data().title;
            console.log("Load Image working");
            // retrieving the image from storage (firebase)
            storageRef
            .child("images/"+ user_name)
            .getDownloadURL()
            .then(function(url){
                let img= document.createElement("img");
                url="https://cors-anywhere.herokuapp.com/"+url
                img.setAttribute('crossOrigin', '');
                img.src=url;
                img.addEventListener("load",function(){
                    context.drawImage(img,0,0);
                })
            })
            .catch(function(error){
                    console.error("Upload failed:", error);
                })


        })
        .catch(error=>{
            console.log("Error getting document:",error);
        })


    }

    window.addEventListener("hashchange",e=>{
        let option = location.hash.slice(1);

        // making everything vanish and add as per option
        text_notepad.style.display = "none";
        sign_up.style.display = "none";
        login.style.display = "none";
        paint.style.display = "none";
        if (option === "sign-in"){
            sign_up.style.display="block";
        }else if(option === "log-in"){
            login.style.display="block";
        }else if(option === "notepad" ){
            text_notepad.style.display="block";
        }else if(option === "sign-out"){
            auth.signOut();
            location.hash="#";
        }else if(option === "paint"){
            paint.style.display="block"
        }else{
            text_notepad.style.display = "block";
        }
    })

    //change the font as per options
    fonts.addEventListener("change",()=>{
        textarea.style.fontFamily= fonts.value;
        console.log(fonts.value);
    })

    auth.onAuthStateChanged((user)=>{
        if(user){
            //console.log(user);
            user_name = user.email;
            document_name = user.email;
            console.log(user);
            //saveImage(document_name);
            //storeData(user_name);
            logged_in_options.forEach(item => item.style.display="block");
            logged_out_options.forEach(item => item.style.display = "none");    
            loadData(document_name);
            load_image();
        }   
        else{
            logged_in_options.forEach(item => item.style.display="none");
            logged_out_options.forEach(item => item.style.display = "block");
            document_name = "anonymous";
            textarea.value="Sign_in to store ur data permanently....   ";
            user_name = "anonymous";
        }
    })

    sign_up_form.addEventListener("submit",e=>{
        e.preventDefault();

        const email = sign_up_form["signup-email"].value;
        const password = sign_up_form["signup-password"].value;
        auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
          //console.log(userCredential);
          sign_up_form.reset();
          location.hash="#notepad";
        })

    });


    login_form.addEventListener("submit",e=>{
        e.preventDefault();
        const email = login_form["login-email"].value;
        const password = login_form["login-password"].value;
        auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          //console.log(userCredential);
          login_form.reset();
          location.hash="#notepad";
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
        });
        

    });


    //change the font-size as per input 
    font_size.addEventListener("change",()=>{
        textarea.style.fontSize= font_size.value+"px";
        //console.log(font_size.value);
    })

    //change the text to bold 
    bold.addEventListener("click",()=>{
        if(!bold_flag)
        {
            textarea.style.fontWeight="bold";
        }
        else
        {
            textarea.style.fontWeight="normal";
        }
        bold_flag=!bold_flag;
        //console.log("bold");
    })

    //change the text to italics 
    italics.addEventListener("click",()=>{
        if(!italic_flag){
            textarea.style.fontStyle="italic";
        }
        else{
            textarea.style.fontStyle="normal";
        }
        italic_flag=!italic_flag;
        //console.log("italic");

    })

    //change the text to underline 
    underline.addEventListener("click",()=>{
        if(!underline_flag){
            textarea.style.textDecoration="underline";
        }
        else{
            textarea.style.textDecoration="none";;
        }
        underline_flag=!underline_flag;
    })


    function loadData(document_name){
        db.collection("multimedia")
        .doc(document_name)
        .onSnapshot(doc=>{
            doc_obj = doc.data()
            console.log(doc_obj.text);
            textarea.value = doc_obj.text;
        })
        
    }

    function storeData(){
        db
        .collection("multimedia")
        .doc(document_name)
        .set({
            text: textarea.value
        })
        .then(()=>{
            console.log("Text written successfully: ");
        })
        .catch(function(error){
            console.error("Error adding Text: ",error);
        })
    }

    function clearData(){

        db.collection("multimedia")
        .doc(document_name)
        .delete()
        .then(() => {
            console.log("Document successfully deleted!");
        })
        .catch((error) => {
            console.error("Error removing document: ", error);
        });

    }

    window.addEventListener("keydown",e=>{
        if(e.ctrlKey && (e.key=='S' || e.key=='s')){
            e.preventDefault();
            storeData(document_name);
        }
    });

    saveBtn.addEventListener("click",e=>storeData());
    

    



};
const getJSON = async () => {
    try {
        // let response = await fetch("http://localhost:3001/api/crafts");
        let response = await fetch("https://server-edit-delete-g3jv.onrender.com/api/crafts"); // Alternative URL needed for new render
        return await response.json();
    } catch (error) {
        console.log("error retrieving json");
        return "";
    }
};


const populateEditForm = (craft) => {
    const form = document.getElementById("add-edit-form");
    form._id.value = craft._id;
    form.name.value = craft.name;
    form.description.value = craft.description;

    populateSupplies(craft.supplies); 

    const imgPreview = document.getElementById("img-prev");
    imgPreview.src = "images/" + craft.image;
};


const populateSupplies = (supplies) => {
    const section = document.getElementById("moresupplies");
    supplies.forEach((supply) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = supply;
        section.append(input);
        section.append(document.createElement("br")); 
    });
};

const deleteCraft = async (craft) => {
    let response = await fetch(`/api/crafts/${craft._id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });

    if (response.status === 200) {
        console.log("Craft deleted successfully.");
        document.getElementById("craft-list").innerHTML = '';
        showCrafts(); 
    } else {
        console.log("Error deleting craft.");
    }
};



const addEditForm = async (e) => {
    e.preventDefault();
    const form = document.getElementById("add-edit-form");
    const formData = new FormData(form);
    
    formData.append("supplies", getSupplies());
    console.log(...formData);

    if(form._id.value.trim() == "") {
        console.log("in post");
        response = await fetch("/api/crafts", {
            method: "POST",
            body: formData,
        });
    } else {
        response = await fetch(`/api/crafts/${form._id.value}`, {
            method: "PUT",
            body: formData,
        });
    }

    //error
    if(response.status != 200){
        console.log("Error contacting server");
        return;
    }

    await response.json();
    resetForm();

    const craftDiv = document.getElementById("craft-list");
        craftDiv.innerHTML = '';

    document.getElementById("add-edit-modal").style.display = "none";
    showCrafts(); 
};

const getSupplies = () => {
    const inputs = document.querySelectorAll("#moresupplies input");
    const supplies = [];

    inputs.forEach((input)=>{
        supplies.push(input.value);
    });

    return supplies;
};

const resetForm = () => {
    const form = document.getElementById("add-edit-form");
    form.reset();
    document.getElementById("moresupplies").innerHTML = "";
    document.getElementById("img-prev").src="";
};

const showCrafts = async () => {
    const craftJSON = await getJSON();

    if (craftJSON == "") {
        return;
    }


    let craftDiv = document.getElementById("craft-list");
    let columns = [];
    for (let i = 0; i < 4; i++) {
        let column = document.createElement("div");
        column.className = "column";
        craftDiv.append(column);
        columns.push(column);
    }

    craftJSON.forEach((craft, index) => {
        if (!craft) {
            console.warn(`Undefined craft object at index: ${index}`);
        } else {
            let column = columns[index % 4];
            let img = document.createElement("img");
            
            img.src = "images/" + craft.image;
            img.onclick = () => openModalWithCraft(craft);
            column.append(img);
        }
    });
    
};

// Function to open the craft details modal
function openModalWithCraft(craft) {
    var modal = document.getElementById("myModal");
    modal.style.display = "block";
     
    var modalContent = modal.querySelector(".modal-content");
    modalContent.innerHTML = '<span class="close">&times;</span>'; //simplified stack clear
    
    //flex container and append data
    var flexContainer = document.createElement("div");
    flexContainer.className = "modal-flex-container";

    var imgDiv = document.createElement("div");
    imgDiv.className = "modal-img-container";
    var img = document.createElement("img");
    img.src="/images/" + craft.image; 
    imgDiv.append(img);
    flexContainer.append(imgDiv);

    var textContentDiv = document.createElement("div");
    textContentDiv.className = "modal-text-container";

    var name = document.createElement("h2");
    name.textContent = craft.name;
    textContentDiv.append(name);

    var description = document.createElement("p");
    description.textContent = craft.description;
    textContentDiv.append(description);

    var supplies = document.createElement("h2");
    supplies.innerHTML = "Supplies"
    textContentDiv.append(supplies);

    if (craft.supplies.length) {
        var ul = document.createElement("ul");
        craft.supplies.forEach(supply => {
            var li = document.createElement("li");
            li.textContent = supply;
            ul.append(li);
        });
        textContentDiv.append(ul);
    }

    flexContainer.append(textContentDiv);
    modalContent.append(flexContainer);

     var editButton = document.createElement("button");
     editButton.textContent = "Edit";
     editButton.onclick = function() {
         console.log("Edit button clicked");
         populateEditForm(craft); 
         document.getElementById("myModal").style.display = "none"; 
         document.getElementById("add-edit-modal").style.display = "block"; 
     };
     modalContent.append(editButton); 
 
     var deleteButton = document.createElement("button");
     deleteButton.textContent = "Delete";
     deleteButton.onclick = function() {
        console.log("delete button clicked");
        deleteCraft(craft);
        document.getElementById("myModal").style.display = "none"; 
     };
     modalContent.append(deleteButton); 
    modal.querySelector('.close').onclick = function() {
        modal.style.display = "none";
    };

}

//necessary changes due to overlap with other modal causing issues displaying anything at all
document.addEventListener('DOMContentLoaded', () => {

    document.getElementById("add-link").addEventListener("click", function(event) {
        event.preventDefault();
        resetForm(); 
        document.getElementById("add-edit-modal").style.display = "block";
    });

    document.querySelector("#add-edit-modal .close").onclick = function() {
        document.getElementById("add-edit-modal").style.display = "none";
    };

    document.getElementById("addSupplyButton").addEventListener("click", function() {
        const newSupplyInput = document.createElement("input");
        newSupplyInput.type = "text";
        newSupplyInput.required = true;
    
        const breakLine = document.createElement("br");
    
        moresupplies.append(newSupplyInput);
        moresupplies.append(breakLine);
    });

    document.getElementById("cancelbutton").addEventListener("click", function() {
        resetForm();
        document.getElementById("add-edit-modal").style.display = "none";
    });
    
    
    window.onclick = function(event) {
        if (event.target == document.getElementById("myModal")) {
            document.getElementById("myModal").style.display = "none";
        } else if (event.target == document.getElementById("add-edit-modal")) {
            document.getElementById("add-edit-modal").style.display = "none";
        }
    };
});


window.onload = () => {
    showCrafts();
    document.getElementById("add-edit-form").onsubmit = addEditForm;
};


document.getElementById("image").onchange = (e) => {
    const prev = document.getElementById("img-prev");

    if(!e.target.files.length){
        prev.src = "";
        return;
    }

    prev.src = URL.createObjectURL(e.target.files.item(0));
}


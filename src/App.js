import './App.css';
import { useState, useEffect, useRef } from "react";
import axios from "axios";


function App() {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const inputFocus = useRef(null);

  // it did not work for cleaning up the input file after submitting
  // const inputFileRef = useRef(null);

  const submit = async e => {
    setMessage("");
    e.preventDefault();

    if (!file) {
      setMessageClass("error");
      setMessage("Please, choose a file. Description is good, too. ;)");
      return;
    }

    // check file's size to apply size limit
    // frontend checking
    const fileSize = file.size;
    const oneMB = 1048576;
    if (fileSize > oneMB) {
      alert(`Please, update files smaller than 1MB. \nYour current file is about ${Math.round(fileSize / oneMB)}MB volume.`);
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("description", description);

    const sendData = await axios.post(
      "/api/images", 
      formData,
      {
        headers: {"Content-type": "multipart/form-data"}
      }
    );
    
    if (sendData.data.error) {
      setMessageClass("error");
      setMessage(sendData.data.error);
    } else {
      e.target.value = null;
      const newData = {
        id: sendData.data.id,
        description: sendData.data.description,
        file_name: sendData.data.file_name,
        created: sendData.data.created
      };
      
      setImages([newData, ...images]);
      setMessageClass("success");
      setMessage(sendData.data.message);
      setDescription("");
      // inputFileRef.current.value = "";
      setFile(null);
    }

    inputFocus.current.focus();
  }


  const formatDate = incomingDtHr => {
    // helping formating date
    // https://www.freecodecamp.org/news/how-to-format-dates-in-javascript/
    const dtBase = new Date(incomingDtHr);
    const dt = dtBase.toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}) ;

    const min = dtBase.getMinutes();
    const hr = `${dtBase.getHours()}:${(min < 10 ? `0${min}` : min)}`;
    return `${dt} ??? ${hr}`;
  };


  const closeMessage = () => {
    setMessage("");
    inputFocus.current.focus();
  }


  const deleteItem = async id => {

    const confirmRemoving = window.confirm("Do you confirm removing this item?")
    if (!confirmRemoving)
      return;

    const rmItem = await axios.delete(`/api/images/rm/${id}`);
// console.log("rmItem ", rmItem)
    if (rmItem.data.error) {
      setMessageClass("error");
      setMessage(rmItem.data.error);
    } else {
      const updateImages = images.filter(e => e.id !== id);
      setImages(updateImages);
      setMessageClass("success");
      setMessage(rmItem.data.message);
    }



  }

  // first run, it gets all images to load on the page
  useEffect(() => {
    (async () => {
      const getData = await axios.get("/api/images");
      setImages(getData.data);
    })();
  }, []);


  return (
    <div className = "container">
      <header>

        <form onSubmit = { submit } >
          <section className = "description">
            <label htmlFor = "description">Description</label>
            <input
              type        = "text"
              onChange    = { e => setDescription(e.target.value) }
              value       = { description }
              id          = "description"
              ref         = { inputFocus }
              placeholder = "Type your description for this image, please."
              autoFocus
            />
          </section>

          <input
            type      = "file"
            filename  = { file }
            onChange  = { e => setFile(e.target.files[0])}
            accept    = "image/*"
            // ref       = { inputFileRef }
          />

          <button type = "submit">Submit your Image</button>
        </form>
      </header>

      <main>
        {message && 
          <div className = "container-message">
            <p className = {`container-message-text ${messageClass}`}>{ message }</p>
            <button 
              onClick = { closeMessage }
              title = {`It just close this ${messageClass} message`}
            >Close Message</button>
          </div>
        }

        {(images && images.length)
          ? 
            images.map((e, i) => (
              <div key={i} className = "container-images">
                <img src={`./images/${e.file_name}`} alt={e.fileName} className = "image-file"/>
                <div className = "image-details">
                  <div>
                    <p className = "image-details-dt">{formatDate(e.created)}</p>
                    <p className = "image-details-desc">{e.description}</p>
                  </div>
                  <button 
                    className = "remove-image-bt"
                    title     = "Delete the whole item -> image + details"
                    onClick   = { () => deleteItem(e.id) }
                  >Remove this item</button>
                </div>
              </div>))
          : <p className = "no-images-message">No images so far.</p>
        }

      </main>

      <footer>
        <p>&copy; Tony Kieling ??? 2023</p>
      </footer>
    </div>
  );
}

export default App;

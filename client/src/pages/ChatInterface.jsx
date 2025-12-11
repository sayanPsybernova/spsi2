import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Phone, 
  Video, 
  ArrowLeft, 
  Smile, 
  Camera, 
  Mic,
  Check,
  CheckCheck,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// WhatsApp Colors
const WA_TEAL = "#008069";
const WA_BG_LIGHT = "#e5ded3";
const WA_BG_DARK = "#0b141a";
const WA_MSG_IN_LIGHT = "#ffffff";
const WA_MSG_OUT_LIGHT = "#d9fdd3";
const WA_MSG_IN_DARK = "#202c33";
const WA_MSG_OUT_DARK = "#005c4b";

export default function ChatInterface() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "👋 Welcome to SPSI Chat Assistant! \n\nI can help you manage your tasks quickly. \n\nTo get started, please select your **Role**:",
      type: "options",
      options: ["Supervisor", "Validator", "Admin", "Super Admin"],
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [currentStep, setCurrentStep] = useState("ROLE_SELECT");
  const [tempData, setTempData] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Master Data for Supervisor Flow
  const [workOrders, setWorkOrders] = useState([]);
  const [lineItems, setLineItems] = useState([]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (text, sender = "user", type = "text", options = []) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender,
        text,
        type,
        options,
        timestamp: new Date(),
      },
    ]);
  };

  const handleUserInput = async (text) => {
    if (!text.trim()) return;

    addMessage(text, "user");
    setInputText("");
    
    // Process input based on current step
    await processStep(text);
  };

  const handleOptionClick = async (option) => {
    addMessage(option, "user");
    await processStep(option);
  };

  const processStep = async (input) => {
    setLoading(true);
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600));

    try {
      switch (currentStep) {
        case "ROLE_SELECT":
          setTempData({ ...tempData, role: input.toLowerCase().replace(" ", "") });
          addMessage("Great! Please enter your **Email ID** or **User ID**:");
          setCurrentStep("EMAIL_INPUT");
          break;

        case "EMAIL_INPUT":
          setTempData(prev => ({ ...prev, email: input }));
          addMessage("Please enter your **Password**:", "bot", "password"); // Custom type for masking if needed
          setCurrentStep("PASSWORD_INPUT");
          break;

        case "PASSWORD_INPUT":
          // Perform Login
          try {
            const result = await login(tempData.email, input);
            if (result.success) {
              setTempData(prev => ({ ...prev, user: result.user }));
              
              addMessage(`✅ Login Successful! Welcome **${result.user.name}**.`);
              
              // Determine next flow based on role
              if (tempData.role === 'supervisor') {
                addMessage("Fetching Work Orders...");
                const woRes = await axios.get(`${API_ENDPOINTS.uploads}/../api/work-orders`);
                setWorkOrders(woRes.data);
                
                const woOptions = woRes.data.map(wo => wo.order_number);
                addMessage("Select a **Work Order** to create an entry:", "bot", "options", woOptions);
                setCurrentStep("WO_SELECT");
              } else {
                 addMessage("Currently, only the Supervisor Chat Flow is fully implemented. Type 'Logout' to exit.");
                 setCurrentStep("IDLE");
              }
            } else {
              addMessage(`❌ Login Failed: ${result.message}. Please try entering your password again.`);
              // Stay on PASSWORD_INPUT
            }
          } catch (err) {
            addMessage("❌ Error connecting to server. Please try again.");
          }
          break;

        case "WO_SELECT":
          const selectedWO = workOrders.find(wo => wo.order_number === input);
          if (selectedWO) {
            setTempData(prev => ({ ...prev, workOrderId: selectedWO.id }));
            
            // Fetch Line Items
            const liRes = await axios.get(`${API_ENDPOINTS.uploads}/../api/line-items?workOrderId=${selectedWO.id}`);
            setLineItems(liRes.data);
            
            const liOptions = liRes.data.map(li => li.name);
            addMessage(`Selected: ${input}. \nNow select a **Line Item**:` , "bot", "options", liOptions);
            setCurrentStep("LI_SELECT");
          } else {
            addMessage("Invalid Work Order. Please select from the list.");
          }
          break;
        
        case "LI_SELECT":
            const selectedLI = lineItems.find(li => li.name === input);
            if (selectedLI) {
                setTempData(prev => ({ ...prev, lineItemId: selectedLI.id, uom: selectedLI.uom }));
                addMessage(`Selected: ${input}. \n Enter **Quantity** (in ${selectedLI.uom}):`);
                setCurrentStep("QTY_INPUT");
            } else {
                addMessage("Invalid Line Item.");
            }
            break;

        case "QTY_INPUT":
            setTempData(prev => ({ ...prev, quantity: input }));
            addMessage("Enter **Actual Manpower** details (e.g., 1 Sup + 3 Lab):");
            setCurrentStep("MANPOWER_INPUT");
            break;

        case "MANPOWER_INPUT":
            setTempData(prev => ({ ...prev, actualManpower: input }));
            addMessage("Enter **Material Consumed** (Optional, type 'None' to skip):");
            setCurrentStep("MATERIAL_INPUT");
            break;

        case "MATERIAL_INPUT":
             setTempData(prev => ({ ...prev, materialConsumed: input }));
             addMessage("📸 Please upload **Evidence Photos**.\n\n(Click the Camera icon below - simulated for now, type 'Done' to finish uploading)");
             // In a real mobile view, this would trigger camera. For now, we simulate.
             setCurrentStep("PHOTO_UPLOAD");
             break;

        case "PHOTO_UPLOAD":
            if (input.toLowerCase() === 'done') {
                // Submit Data
                addMessage("⏳ Submitting your entry...");
                
                const data = new FormData();
                data.append("supervisorId", tempData.user.userId || tempData.user.email);
                data.append("supervisorName", tempData.user.name);
                data.append("workOrderId", tempData.workOrderId);
                data.append("lineItemId", tempData.lineItemId);
                data.append("quantity", tempData.quantity);
                data.append("actualManpower", tempData.actualManpower);
                data.append("materialConsumed", tempData.materialConsumed === 'None' ? '' : tempData.materialConsumed);
                
                // Mock photo for chat demo if none provided
                // In real implementation, handleFileSelect would populate a 'files' array in tempData
                
                try {
                    await axios.post(API_ENDPOINTS.submissions, data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                    addMessage("✅ **Submission Successful!** \n\nWhat would you like to do next?", "bot", "options", ["New Entry", "Logout"]);
                    setCurrentStep("POST_SUBMIT_ACTION");
                } catch (err) {
                    addMessage("❌ Error submitting data. Please try again.");
                }

            } else {
                addMessage("Photo uploaded (simulated). Type **'Done'** to submit.");
            }
            break;
        
        case "POST_SUBMIT_ACTION":
            if (input === "New Entry") {
                 // Reset flow to WO Select
                 const woOptions = workOrders.map(wo => wo.order_number);
                 addMessage("Select a **Work Order**:", "bot", "options", woOptions);
                 setCurrentStep("WO_SELECT");
            } else if (input === "Logout") {
                navigate("/login");
            }
            break;

        default:
          addMessage("I didn't understand that. Please try again.");
      }
    } catch (error) {
       console.error(error);
       addMessage("Something went wrong.");
    } finally {
        setLoading(false);
    }
  };

  const handleCameraClick = () => {
      if (currentStep === "PHOTO_UPLOAD") {
          addMessage("📸 [Photo Uploaded]", "user");
          // Logic to handle actual file upload would go here
      } else {
          addMessage("You can only upload photos when asked.", "bot");
      }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900">
        {/* Mobile Container */}
        <div className="w-full max-w-md h-[100vh] sm:h-[90vh] bg-[#0b141a] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-slate-800">
            
            {/* Header */}
            <div className="bg-[#202c33] p-3 flex items-center justify-between text-gray-200 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/login')}><ArrowLeft size={20} /></button>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center font-bold text-white">
                        S
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">SPSI Assistant</h3>
                        <p className="text-xs text-gray-400">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <Video size={20} />
                    <Phone size={20} />
                    <MoreVertical size={20} />
                </div>
            </div>

            {/* Chat Background */}
            <div 
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b141a] relative"
                style={{ 
                    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px',
                    backgroundBlendMode: 'soft-light'
                }}
            >
                {/* Overlay to darken the background pattern */}
                <div className="absolute inset-0 bg-[#0b141a]/90 pointer-events-none"></div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`relative z-10 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg text-sm shadow-md relative ${ 
                                msg.sender === "user"
                                    ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
                                    : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                            }`}
                        >
                            {/* Message Text */}
                            <p className="whitespace-pre-wrap leading-relaxed">
                                {msg.text.split("**").map((part, i) => 
                                    i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
                                )}
                            </p>

                            {/* Options Buttons */}
                            {msg.type === "options" && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {msg.options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleOptionClick(opt)}
                                            className="bg-[#2a3942] hover:bg-[#364852] text-[#00a884] font-medium py-2 px-4 rounded-lg text-sm flex-grow text-center transition-colors border border-[#2a3942]"
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Timestamp & Status */}
                            <div className="flex justify-end items-center gap-1 mt-1 opacity-60">
                                <span className="text-[10px]">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {msg.sender === "user" && <CheckCheck size={14} className="text-[#53bdeb]" />}
                            </div>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start relative z-10">
                        <div className="bg-[#202c33] p-3 rounded-lg rounded-tl-none">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#202c33] p-2 flex items-center gap-2 z-10">
                <button className="p-2 text-gray-400 hover:text-gray-200">
                    <Smile size={24} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-200" onClick={handleCameraClick}>
                    <Camera size={24} />
                </button>
                
                <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 flex items-center">
                    <input
                        type={currentStep === "PASSWORD_INPUT" ? "password" : "text"}
                        placeholder={currentStep === "PASSWORD_INPUT" ? "Type password..." : "Message..."}
                        className="bg-transparent text-[#d1d7db] w-full outline-none placeholder:text-gray-500"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUserInput(inputText)}
                    />
                </div>

                <button 
                    onClick={() => handleUserInput(inputText)}
                    className="p-3 bg-[#00a884] rounded-full text-white shadow-lg hover:bg-[#008f72] transition-colors"
                >
                    {inputText.trim() ? <Send size={20} /> : <Mic size={20} />}
                </button>
            </div>
        </div>
    </div>
  );
}

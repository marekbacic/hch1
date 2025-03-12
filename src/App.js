import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Główny komponent aplikacji
const App = () => {
  const [activeTab, setActiveTab] = useState('chemicalConsumption');
  const [currentUser, setCurrentUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // Stan dla produktów
  const [products, setProducts] = useState([
    { id: "1", name: "eska®clean 1001", consumption: 180 },
    { id: "2", name: "eska®clean 2250", consumption: 150 },
    { id: "3", name: "eska®strip H 365A", consumption: 220, density: 1.21 },
    { id: "4", name: "eska®phos 2023", consumption: 160 },
    { id: "5", name: "eska®phos 3045", consumption: 190 }
  ]);
  
  // Baza danych chłodziw
  const coolantDatabase = [
    {
      name: "eska®cool 2300",
      hardnessRange: "-",
      hardnessTotal: 10,
      oilPercent: 0,
      refractionMultiplier: 2.1,
      components: {
        bor: false,
        amin: true,
        dcha: false,
        fad: false
      },
      lubricationEfficiency: {
        low: "good", // ●●
        medium: "not-suitable", // -
        high: "not-suitable" // -
      },
      operationTypes: {
        grinding: "good", // ●●
        turning: "not-suitable", // -
        millingDrilling: "not-suitable" // -
      },
      materials: {
        steel: "best", // ●●●
        stainlessSteel: "best", // ●●●
        castIron: "good", // ●●
        aluminum: "not-suitable", // -
        nonFerrousMetals: "not-suitable", // -
        carbide: "not-suitable" // -
      }
    },
    {
      name: "eska®cool 5200",
      hardnessRange: "-",
      hardnessTotal: 10,
      oilPercent: 0,
      refractionMultiplier: 1.5,
      components: {
        bor: false,
        amin: true,
        dcha: false,
        fad: false
      },
      lubricationEfficiency: {
        low: "good", // ●●
        medium: "not-suitable", // -
        high: "not-suitable" // -
      },
      operationTypes: {
        grinding: "good", // ●●
        turning: "conditionally-suitable", // ○
        millingDrilling: "conditionally-suitable" // ○
      },
      materials: {
        steel: "not-suitable", // -
        stainlessSteel: "suitable", // ●
        castIron: "best", // ●●●
        aluminum: "best", // ●●●
        nonFerrousMetals: "not-suitable", // -
        carbide: "not-suitable" // -
      }
    },
    {
      name: "eska®lub 1220",
      hardnessRange: "2-30",
      hardnessTotal: 8,
      oilPercent: 30,
      refractionMultiplier: 1.3,
      components: {
        bor: false,
        amin: true,
        dcha: false,
        fad: false
      },
      lubricationEfficiency: {
        low: "good", // ●●
        medium: "suitable", // ●
        high: "not-suitable" // -
      },
      operationTypes: {
        grinding: "good", // ●●
        turning: "good", // ●●
        millingDrilling: "good" // ●●
      },
      materials: {
        steel: "good", // ●●
        stainlessSteel: "suitable", // ●
        castIron: "good", // ●●
        aluminum: "good", // ●●
        nonFerrousMetals: "suitable", // ●
        carbide: "suitable" // ●
      }
    },
    {
      name: "eska®lub 2320",
      hardnessRange: "5-30",
      hardnessTotal: 6,
      oilPercent: 30,
      refractionMultiplier: 1.3,
      components: {
        bor: false,
        amin: true,
        dcha: true,
        fad: false
      },
      lubricationEfficiency: {
        low: "good", // ●●
        medium: "good", // ●●
        high: "not-suitable" // -
      },
      operationTypes: {
        grinding: "good", // ●●
        turning: "good", // ●●
        millingDrilling: "best" // ●●●
      },
      materials: {
        steel: "good", // ●●
        stainlessSteel: "best", // ●●●
        castIron: "conditionally-suitable", // ○
        aluminum: "conditionally-suitable", // ○
        nonFerrousMetals: "not-suitable", // -
        carbide: "not-suitable" // -
      }
    },
    {
      name: "eska®lub 3350",
      hardnessRange: "5-30",
      hardnessTotal: 15,
      oilPercent: 30,
      refractionMultiplier: 1.2,
      components: {
        bor: false,
        amin: true,
        dcha: true,
        fad: false
      },
      lubricationEfficiency: {
        low: "good", // ●●
        medium: "good", // ●●
        high: "suitable" // ●
      },
      operationTypes: {
        grinding: "good", // ●●
        turning: "good", // ●●
        millingDrilling: "good" // ●●
      },
      materials: {
        steel: "best", // ●●●
        stainlessSteel: "good", // ●●
        castIron: "good", // ●●
        aluminum: "best", // ●●●
        nonFerrousMetals: "suitable", // ●
        carbide: "conditionally-suitable" // ○
      }
    },
    {
      name: "eska®lub 4131",
      hardnessRange: "15-25",
      hardnessTotal: 6,
      oilPercent: 45,
      refractionMultiplier: 1.0,
      components: {
        bor: false,
        amin: false,
        dcha: false,
        fad: false
      },
      lubricationEfficiency: {
        low: "suitable", // ●
        medium: "good", // ●●
        high: "good" // ●●
      },
      operationTypes: {
        grinding: "good", // ●●
        turning: "good", // ●●
        millingDrilling: "good" // ●●
      },
      materials: {
        steel: "best", // ●●●
        stainlessSteel: "not-suitable", // -
        castIron: "best", // ●●●
        aluminum: "suitable", // ●
        nonFerrousMetals: "suitable", // ●
        carbide: "not-suitable" // -
      }
    },
    {
      name: "eska®lub 4300",
      hardnessRange: "10-30",
      hardnessTotal: 6,
      oilPercent: 45,
      refractionMultiplier: 1.0,
      components: {
        bor: false,
        amin: true,
        dcha: true,
        fad: false
      },
      lubricationEfficiency: {
        low: "suitable", // ●
        medium: "good", // ●●
        high: "good" // ●●
      },
      operationTypes: {
        grinding: "good", // ●●
        turning: "good", // ●●
        millingDrilling: "best" // ●●●
      },
      materials: {
        steel: "best", // ●●●
        stainlessSteel: "suitable", // ●
        castIron: "suitable", // ●
        aluminum: "conditionally-suitable", // ○
        nonFerrousMetals: "not-suitable", // -
        carbide: "not-suitable" // -
      }
    },
    {
      name: "eska®lub 4335",
      hardnessRange: "10-30",
      hardnessTotal: 6,
      oilPercent: 40,
      refractionMultiplier: 1.0,
      components: {
        bor: false,
        amin: true,
        dcha: true,
        fad: false
      },
      lubricationEfficiency: {
        low: "suitable", // ●
        medium: "good", // ●●
        high: "good" // ●●
      },
      operationTypes: {
        grinding: "suitable", // ●
        turning: "good", // ●●
        millingDrilling: "good" // ●●
      },
      materials: {
        steel: "best", // ●●●
        stainlessSteel: "best", // ●●●
        castIron: "suitable", // ●
        aluminum: "good", // ●●
        nonFerrousMetals: "conditionally-suitable", // ○
        carbide: "not-suitable" // -
      }
    },
    {
      name: "eska®lub 6530",
      hardnessRange: "10-30",
      hardnessTotal: 6,
      oilPercent: 65,
      refractionMultiplier: 0.9,
      components: {
        bor: false,
        amin: false,
        dcha: false,
        fad: true
      },
      lubricationEfficiency: {
        low: "suitable", // ●
        medium: "good", // ●●
        high: "suitable" // ●
      },
      operationTypes: {
        grinding: "not-suitable", // -
        turning: "good", // ●●
        millingDrilling: "good" // ●●
      },
      materials: {
        steel: "conditionally-suitable", // ○
        stainlessSteel: "suitable", // ●
        castIron: "not-suitable", // -
        aluminum: "good", // ●●
        nonFerrousMetals: "best", // ●●●
        carbide: "good" // ●●
      }
    }
  ];

  // Funkcja logowania przez Firebase
  const handleLogin = async () => {
    setLoginError('');
    
    if (!loginCredentials.email || !loginCredentials.password) {
      setLoginError('Wprowadź email i hasło');
      return;
    }
    
    try {
      // Logowanie za pomocą Firebase Auth
      await signInWithEmailAndPassword(auth, loginCredentials.email, loginCredentials.password);
      
      setLoginModalOpen(false);
      setLoginCredentials({ email: '', password: '' });
      
    } catch (error) {
      console.error('Błąd logowania:', error);
      setLoginError('Nieprawidłowy email lub hasło');
    }
  };
  
  // Funkcja wylogowania przez Firebase
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
      setActiveTab('chemicalConsumption');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };
  
  // Funkcja tworzenia nowego użytkownika
  const createUser = async (email, password, displayName, role) => {
    try {
      // Utworzenie konta w Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Dodaj dodatkowe dane użytkownika do Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        role: role,
        createdAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Błąd tworzenia użytkownika:', error);
      return false;
    }
  };

  // Globalne ustawienia dla Firebase i Netlify
  useEffect(() => {
    // Sprawdź, czy aplikacja działa na Netlify
    if (window.location.hostname.includes('netlify.app')) {
      // Konfiguracja CORS dla Netlify
      const metaTag = document.createElement('meta');
      metaTag.httpEquiv = 'Content-Security-Policy';
      metaTag.content = "default-src 'self' *.firebaseio.com *.firebase.com *.googleapis.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' *.firebaseio.com *.firebase.com *.googleapis.com; connect-src 'self' *.firebaseio.com *.firebase.com *.googleapis.com";
      document.head.appendChild(metaTag);
      
      console.log('Wykryto Netlify - zastosowano dodatkową konfigurację');
    }
    
    // Inicjalizacja aplikacji - sprawdź połączenie z Firebase
    const checkFirebaseConnection = async () => {
      try {
        // Próba pobrania produktów jako test połączenia
        const querySnapshot = await getDocs(collection(db, "products"));
        console.log('Połączenie z Firebase ustanowione pomyślnie');
        
        // Jeśli brak produktów, dodaj przykładowe
        if (querySnapshot.empty) {
          console.log('Brak produktów w bazie - dodawanie przykładowych danych');
          await addInitialData();
        }
      } catch (error) {
        console.error('Błąd połączenia z Firebase:', error);
        // Przejście na dane lokalne w przypadku awarii
        setProducts([
          { id: "1", name: "eska®clean 1001", consumption: 180 },
          { id: "2", name: "eska®clean 2250", consumption: 150 },
          { id: "3", name: "eska®strip H 365A", consumption: 220, density: 1.21 },
          { id: "4", name: "eska®phos 2023", consumption: 160 },
          { id: "5", name: "eska®phos 3045", consumption: 190 }
        ]);
      }
    };
    
    checkFirebaseConnection();
  }, []);
  
  // Dodaj początkowe dane do Firebase
  const addInitialData = async () => {
    try {
      // Dodaj przykładowe produkty
      const initialProducts = [
        { name: "eska®clean 1001", consumption: 180 },
        { name: "eska®clean 2250", consumption: 150 },
        { name: "eska®strip H 365A", consumption: 220, density: 1.21 },
        { name: "eska®phos 2023", consumption: 160 },
        { name: "eska®phos 3045", consumption: 190 }
      ];
      
      for (const product of initialProducts) {
        await addDoc(collection(db, "products"), {
          ...product,
          createdAt: new Date().toISOString()
        });
      }
      
      // Dodaj administratora jeśli nie istnieje
      try {
        // Utwórz konto administratora w Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, "admin@haug.com", "admin123");
        const user = userCredential.user;
        
        // Dodaj dane użytkownika do Firestore
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          email: user.email,
          displayName: "Administrator",
          role: "admin",
          createdAt: new Date().toISOString()
        });
        
        console.log('Konto administratora utworzone pomyślnie');
      } catch (error) {
        // Jeśli użytkownik już istnieje, to ignorujemy błąd
        if (error.code === 'auth/email-already-in-use') {
          console.log('Konto administratora już istnieje');
        } else {
          console.error('Błąd tworzenia konta administratora:', error);
        }
      }
      
      // Dodaj przykładowego handlowca
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, "sales@haug.com", "sales123");
        const user = userCredential.user;
        
        // Dodaj dane użytkownika do Firestore
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          email: user.email,
          displayName: "Handlowiec",
          role: "salesRep",
          createdAt: new Date().toISOString()
        });
        
        console.log('Konto handlowca utworzone pomyślnie');
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log('Konto handlowca już istnieje');
        } else {
          console.error('Błąd tworzenia konta handlowca:', error);
        }
      }
      
      console.log('Zainicjalizowano bazę danych z przykładowymi danymi');
    } catch (error) {
      console.error('Błąd podczas inicjalizacji danych:', error);
    }
  };
  
  // Pobierz produkty z Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (productsData.length > 0) {
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania produktów:", error);
    }
  };

  // Kalkulator zużycia chemii
  const ChemicalConsumptionCalculator = () => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [area, setArea] = useState('');
    const [price, setPrice] = useState('');
    const [result, setResult] = useState(null);
    
    const calculateConsumption = () => {
      const product = products.find(p => p.name === selectedProduct);
      if (product && area && price) {
        const areaValue = parseFloat(area);
        const priceValue = parseFloat(price);
        
        const consumptionPerArea = product.consumption / 1000; // g/m² to kg/m²
        const totalConsumption = consumptionPerArea * areaValue; // kg
        const totalCost = totalConsumption * priceValue; // EUR
        
        setResult({
          consumptionPerArea: consumptionPerArea,
          totalConsumption: totalConsumption,
          totalCost: totalCost
        });
      }
    };
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Kalkulator zużycia chemii</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wybierz produkt</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Wybierz produkt</option>
              {products.map(product => (
                <option key={product.id} value={product.name}>{product.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Powierzchnia (m²)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Podaj ilość m²"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cena (EUR/kg)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Podaj cenę w euro za 1 kg"
            />
          </div>
          
          <div className="flex items-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              onClick={calculateConsumption}
            >
              Oblicz
            </button>
          </div>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Wyniki</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Zużycie na 1m²</p>
                <p className="text-xl font-bold">{result.consumptionPerArea.toFixed(3)} kg/m²</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Całkowite zużycie</p>
                <p className="text-xl font-bold">{result.totalConsumption.toFixed(2)} kg</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Całkowity koszt</p>
                <p className="text-xl font-bold">{result.totalCost.toFixed(2)} EUR</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Kalkulator objętości dla eska®strip H 365A
  const VolumeCalculator = () => {
    const [tankVolume, setTankVolume] = useState('');
    const [result, setResult] = useState(null);
    
    const calculateVolume = () => {
      if (tankVolume) {
        const tankVolumeValue = parseFloat(tankVolume);
        
        // Produkt eska®strip H 365A waży 1,21 kg/l i działa w stężeniu 50% wagowo z wodą
        const density = 1.21; // kg/l
        const concentration = 0.5; // 50%
        
        // Obliczamy, ile potrzeba produktu i wody
        const totalTankWeight = tankVolumeValue; // Zakładamy, że waga wody to 1 kg/l
        const chemicalWeight = totalTankWeight * concentration;
        const chemicalVolume = chemicalWeight / density;
        const waterVolume = tankVolumeValue - chemicalVolume;
        
        setResult({
          chemicalVolume: chemicalVolume,
          waterVolume: waterVolume,
          ratio: `1:${(waterVolume / chemicalVolume).toFixed(2)}`
        });
      }
    };
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Kalkulator objętości eska®strip H 365A</h2>
        <p className="mb-4 text-gray-600">
          Preparat waży 1,21 kg na 1 litr i działa w stężeniu 50% wagowo z wodą.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pojemność wanny (litry)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={tankVolume}
              onChange={(e) => setTankVolume(e.target.value)}
              placeholder="Podaj pojemność wanny w litrach"
            />
          </div>
          
          <div className="flex items-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              onClick={calculateVolume}
            >
              Oblicz
            </button>
          </div>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Stosunek chemii do wody</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">eska®strip H 365A</p>
                <p className="text-xl font-bold">{result.chemicalVolume.toFixed(2)} L</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Woda</p>
                <p className="text-xl font-bold">{result.waterVolume.toFixed(2)} L</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Stosunek (chemia:woda)</p>
                <p className="text-xl font-bold">{result.ratio}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Kalkulator uzupełniania stężenia chemii
  const ConcentrationCalculator = () => {
    const [selectedProduct, setSelectedProduct] = useState('');
    const [currentConcentration, setCurrentConcentration] = useState('');
    const [targetConcentration, setTargetConcentration] = useState('');
    const [bathVolume, setBathVolume] = useState('');
    const [result, setResult] = useState(null);
    
    const calculateAddition = () => {
      if (selectedProduct && currentConcentration && targetConcentration && bathVolume) {
        const currentConcentrationValue = parseFloat(currentConcentration);
        const targetConcentrationValue = parseFloat(targetConcentration);
        const bathVolumeValue = parseFloat(bathVolume);
        
        // Obliczenia tylko jeśli stężenie docelowe jest większe od aktualnego
        if (targetConcentrationValue <= currentConcentrationValue) {
          setResult({
            error: "Stężenie docelowe musi być większe od aktualnego!"
          });
          return;
        }
        
        // Wzór: V2 = V1 * (C2 - C1) / (100 - C2)
        // gdzie:
        // V1 - objętość kąpieli
        // C1 - obecne stężenie
        // C2 - stężenie docelowe
        // V2 - objętość chemii do dodania
        
        const chemicalToAdd = bathVolumeValue * (targetConcentrationValue - currentConcentrationValue) / (100 - targetConcentrationValue);
        
        setResult({
          chemicalToAdd: chemicalToAdd,
          newVolume: bathVolumeValue + chemicalToAdd
        });
      }
    };
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Uzupełnianie stężenia chemii</h2>
        <p className="mb-4 text-gray-600">
          Oblicz ilość produktu, którą należy dodać do kąpieli, aby uzyskać wymagane stężenie.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wybierz produkt</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option value="">Wybierz produkt</option>
              {products.map(product => (
                <option key={product.id} value={product.name}>{product.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aktualne stężenie (%)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={currentConcentration}
              onChange={(e) => setCurrentConcentration(e.target.value)}
              placeholder="Podaj aktualne stężenie w %"
              min="0"
              max="100"
            />
          </div>
          
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wymagane stężenie (%)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={targetConcentration}
              onChange={(e) => setTargetConcentration(e.target.value)}
              placeholder="Podaj wymagane stężenie w %"
              min="0"
              max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pojemność wanny (litry)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={bathVolume}
              onChange={(e) => setBathVolume(e.target.value)}
              placeholder="Podaj pojemność wanny w litrach"
              min="0"
            />
          </div>
          
          <div className="md:col-span-2 flex items-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              onClick={calculateAddition}
            >
              Oblicz
            </button>
          </div>
        </div>
        
        {result && !result.error && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium mb-2">Wyniki</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Ilość produktu do dodania</p>
                <p className="text-xl font-bold">{result.chemicalToAdd.toFixed(2)} L</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Nowa objętość kąpieli</p>
                <p className="text-xl font-bold">{result.newVolume.toFixed(2)} L</p>
              </div>
            </div>
          </div>
        )}
        
        {result && result.error && (
          <div className="mt-6 p-4 bg-red-50 rounded-md">
            <h3 className="text-lg font-medium mb-2 text-red-700">Błąd</h3>
            <p className="text-red-700">{result.error}</p>
          </div>
        )}
      </div>
    );
  };

  // Selektor chłodziw
  const CoolantSelector = () => {
    const [waterHardness, setWaterHardness] = useState('');
    const [selectedMaterials, setSelectedMaterials] = useState([]);
    const [selectedOperations, setSelectedOperations] = useState([]);
    const [results, setResults] = useState([]);
    
    const allMaterials = [
      { id: 'steel', name: 'Stal' },
      { id: 'stainlessSteel', name: 'Stal nierdzewna' },
      { id: 'castIron', name: 'Żeliwo' },
      { id: 'aluminum', name: 'Aluminium' },
      { id: 'nonFerrousMetals', name: 'Metale kolorowe' },
      { id: 'carbide', name: 'Węglik' }
    ];
    
    const allOperations = [
      { id: 'grinding', name: 'Szlifowanie' },
      { id: 'turning', name: 'Toczenie' },
      { id: 'millingDrilling', name: 'Frezowanie/Wiercenie' }
    ];
    
    const handleSelectMaterial = (materialId) => {
      if (selectedMaterials.includes(materialId)) {
        setSelectedMaterials(selectedMaterials.filter(id => id !== materialId));
      } else {
        setSelectedMaterials([...selectedMaterials, materialId]);
      }
    };
    
    const handleSelectOperation = (operationId) => {
      if (selectedOperations.includes(operationId)) {
        setSelectedOperations(selectedOperations.filter(id => id !== operationId));
      } else {
        setSelectedOperations([...selectedOperations, operationId]);
      }
    };
    
    const getSuitabilityScore = (suitability) => {
      const scoreMap = {
        'best': 4,
        'good': 3,
        'suitable': 2,
        'conditionally-suitable': 1,
        'not-suitable': 0
      };
      return scoreMap[suitability] || 0;
    };
    
    const findBestCoolants = () => {
      if (!waterHardness || selectedMaterials.length === 0 || selectedOperations.length === 0) {
        return;
      }
      
      const hardnessValue = parseFloat(waterHardness);
      
      const scoredCoolants = coolantDatabase.map(coolant => {
        // Check if water hardness is in range
        let isHardnessInRange = true;
        if (coolant.hardnessRange !== "-") {
          const [min, max] = coolant.hardnessRange.split('-').map(Number);
          isHardnessInRange = hardnessValue >= min && hardnessValue <= max;
        }
        
        // Calculate material suitability score
        let materialScore = 0;
        selectedMaterials.forEach(materialId => {
          materialScore += getSuitabilityScore(coolant.materials[materialId]);
        });
        
        // Calculate operation suitability score
        let operationScore = 0;
        selectedOperations.forEach(operationId => {
          operationScore += getSuitabilityScore(coolant.operationTypes[operationId]);
        });
        
        // Calculate total score
        const totalScore = isHardnessInRange ? (materialScore + operationScore) : 0;
        
        return {
          ...coolant,
          isHardnessInRange,
          materialScore,
          operationScore,
          totalScore
        };
      });
      
      // Sort by total score
      const sortedCoolants = [...scoredCoolants].sort((a, b) => b.totalScore - a.totalScore);
      
      // Filter out coolants with zero score
      const bestCoolants = sortedCoolants.filter(coolant => coolant.totalScore > 0);
      
      setResults(bestCoolants);
    };
    
    // Function to get the rating as dots
    const renderRating = (rating) => {
      const ratings = {
        'best': '●●●',
        'good': '●●',
        'suitable': '●',
        'conditionally-suitable': '○',
        'not-suitable': '-'
      };
      return ratings[rating] || '-';
    };
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Dopasuj chłodziwo</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Twardość wody (°dH)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={waterHardness}
              onChange={(e) => setWaterHardness(e.target.value)}
              placeholder="Podaj twardość wody"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Materiały obrabiane</label>
            <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
              {allMaterials.map(material => (
                <div key={material.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`material-${material.id}`}
                    checked={selectedMaterials.includes(material.id)}
                    onChange={() => handleSelectMaterial(material.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`material-${material.id}`}>{material.name}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rodzaj obróbki</label>
            <div className="bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto">
              {allOperations.map(operation => (
                <div key={operation.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`operation-${operation.id}`}
                    checked={selectedOperations.includes(operation.id)}
                    onChange={() => handleSelectOperation(operation.id)}
                    className="mr-2"
                  />
                  <label htmlFor={`operation-${operation.id}`}>{operation.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-8 rounded"
            onClick={findBestCoolants}
            disabled={!waterHardness || selectedMaterials.length === 0 || selectedOperations.length === 0}
          >
            Znajdź najlepsze chłodziwa
          </button>
        </div>
        
        {results.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Wyniki</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border-b">Nazwa chłodziwa</th>
                    <th className="py-2 px-4 border-b">Zakres twardości</th>
                    <th className="py-2 px-4 border-b">Zawartość oleju</th>
                    <th className="py-2 px-4 border-b">Dopasowanie do materiałów</th>
                    <th className="py-2 px-4 border-b">Dopasowanie do obróbki</th>
                    <th className="py-2 px-4 border-b">Wynik ogólny</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((coolant, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b font-medium">{coolant.name}</td>
                      <td className="py-3 px-4 border-b text-center">{coolant.hardnessRange}</td>
                      <td className="py-3 px-4 border-b text-center">{coolant.oilPercent}%</td>
                      <td className="py-3 px-4 border-b text-center">
                        {selectedMaterials.map(materialId => (
                          <div key={materialId} className="flex justify-between">
                            <span>{allMaterials.find(m => m.id === materialId).name}:</span>
                            <span>{renderRating(coolant.materials[materialId])}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        {selectedOperations.map(operationId => (
                          <div key={operationId} className="flex justify-between">
                            <span>{allOperations.find(o => o.id === operationId).name}:</span>
                            <span>{renderRating(coolant.operationTypes[operationId])}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 border-b text-center font-bold">
                        {coolant.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {waterHardness && selectedMaterials.length > 0 && selectedOperations.length > 0 && results.length === 0 && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded">
            Nie znaleziono pasujących chłodziw. Spróbuj zmienić kryteria wyszukiwania.
          </div>
        )}
      </div>
    );
  };

  // Panel handlowca
  const SalesRepPanel = () => {
    const [clients, setClients] = useState([
      { id: '1', name: 'Firma A', salesRepId: '2' },
      { id: '2', name: 'Firma B', salesRepId: '2' },
      { id: '3', name: 'Firma C', salesRepId: '2' }
    ]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [reports, setReports] = useState([]);
    const [newReport, setNewReport] = useState({
      date: new Date().toISOString().split('T')[0],
      zones: Array(7).fill().map(() => ({
        product: '',
        concentration: '',
        conductivity: '',
        temperature: '',
        ph: ''
      }))
    });
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    
    // Symulowane pobieranie danych klientów
    useEffect(() => {
      if (currentUser && currentUser.role === 'salesRep') {
        // Filtruj klientów dla bieżącego handlowca
        const userClients = clients.filter(client => 
          client.salesRepId === currentUser.id
        );
        
        setClients(userClients);
      }
    }, [currentUser]);
    
    // Symulowane pobieranie raportów
    const fetchReports = (clientId) => {
      // Tutaj w prawdziwej aplikacji pobieralibyśmy dane z Firebase
      const sampleReports = [
        {
          id: '1',
          clientId: clientId,
          date: '2025-03-01',
          zones: [
            { product: 'eska®clean 1001', concentration: '5', conductivity: '1200', temperature: '25', ph: '7.5' },
            { product: 'eska®clean 2250', concentration: '3', conductivity: '800', temperature: '22', ph: '8.0' },
            { product: 'woda_sieciowa', concentration: '', conductivity: '400', temperature: '20', ph: '7.0' }
          ]
        },
        {
          id: '2',
          clientId: clientId,
          date: '2025-02-15',
          zones: [
            { product: 'eska®clean 1001', concentration: '4.5', conductivity: '1150', temperature: '24', ph: '7.3' },
            { product: 'eska®clean 2250', concentration: '2.8', conductivity: '780', temperature: '21', ph: '7.9' }
          ]
        }
      ];
      
      setReports(sampleReports);
    };
    
    // Efekt przy zmianie wybranego klienta
    useEffect(() => {
      if (selectedClient) {
        fetchReports(selectedClient.id);
      }
    }, [selectedClient]);
    
    // Dodaj nowego klienta
    const addClient = () => {
      if (newClientName.trim() === '') return;
      
      const newClient = {
        id: Date.now().toString(),
        name: newClientName,
        salesRepId: currentUser.id
      };
      
      setClients([...clients, newClient]);
      setNewClientName('');
      setShowAddClientModal(false);
    };
    
    // Dodaj nowy raport
    const addReport = () => {
      if (!selectedClient) return;
      
      const newReportData = {
        id: Date.now().toString(),
        clientId: selectedClient.id,
        date: newReport.date,
        zones: newReport.zones.filter(zone => zone.product)
      };
      
      setReports([newReportData, ...reports]);
      
      // Resetuj formularz
      setNewReport({
        date: new Date().toISOString().split('T')[0],
        zones: Array(7).fill().map(() => ({
          product: '',
          concentration: '',
          conductivity: '',
          temperature: '',
          ph: ''
        }))
      });
    };
    
    // Aktualizuj dane strefy w nowym raporcie
    const updateZoneData = (index, field, value) => {
      const updatedZones = [...newReport.zones];
      updatedZones[index] = {
        ...updatedZones[index],
        [field]: value
      };
      setNewReport({
        ...newReport,
        zones: updatedZones
      });
    };
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Panel Handlowca</h2>
        
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Klienci</h3>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                onClick={() => setShowAddClientModal(true)}
              >
                Dodaj klienta
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded border max-h-96 overflow-y-auto">
              {clients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Brak klientów</p>
              ) : (
                clients.map(client => (
                  <div 
                    key={client.id}
                    className={`p-2 mb-1 rounded cursor-pointer ${selectedClient && selectedClient.id === client.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedClient(client)}
                  >
                    {client.name}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            {selectedClient ? (
              <>
                <h3 className="text-lg font-medium mb-4">Raporty - {selectedClient.name}</h3>
                
                <div className="mb-6 p-4 border rounded-md bg-gray-50">
                  <h4 className="text-md font-medium mb-3">Nowy Raport</h4>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data wizyty</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={newReport.date}
                      onChange={(e) => setNewReport({...newReport, date: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Parametry stref</h5>
                    {newReport.zones.map((zone, index) => (
                      <div key={index} className="mb-4 p-3 bg-white rounded shadow-sm">
                        <h6 className="font-medium mb-2">Strefa {index + 1}</h6>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600">Produkt</label>
                            <select
                              className="w-full p-1 border rounded text-sm"
                              value={zone.product}
                              onChange={(e) => updateZoneData(index, 'product', e.target.value)}
                            >
                              <option value="">Wybierz produkt</option>
                              <option value="woda_sieciowa">Woda sieciowa</option>
                              <option value="woda_demi">Woda DEMI</option>
                              {products.map(product => (
                                <option key={product.id} value={product.name}>{product.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600">Stężenie (%)</label>
                            <input
                              type="number"
                              className="w-full p-1 border rounded text-sm"
                              value={zone.concentration}
                              onChange={(e) => updateZoneData(index, 'concentration', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600">Przewodność (μS/cm)</label>
                            <input
                              type="number"
                              className="w-full p-1 border rounded text-sm"
                              value={zone.conductivity}
                              onChange={(e) => updateZoneData(index, 'conductivity', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600">Temperatura (°C)</label>
                            <input
                              type="number"
                              className="w-full p-1 border rounded text-sm"
                              value={zone.temperature}
                              onChange={(e) => updateZoneData(index, 'temperature', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600">pH</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full p-1 border rounded text-sm"
                              value={zone.ph}
                              onChange={(e) => updateZoneData(index, 'ph', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                      onClick={addReport}
                    >
                      Zapisz raport
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-3">Historia raportów</h4>
                  {reports.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Brak historii raportów</p>
                  ) : (
                    <div className="space-y-4">
                      {reports.map(report => (
                        <div key={report.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-medium">Raport z dnia {new Date(report.date).toLocaleDateString()}</h5>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="py-2 px-3 border-b text-left text-xs">Strefa</th>
                                  <th className="py-2 px-3 border-b text-left text-xs">Produkt</th>
                                  <th className="py-2 px-3 border-b text-center text-xs">Stężenie (%)</th>
                                  <th className="py-2 px-3 border-b text-center text-xs">Przewodność</th>
                                  <th className="py-2 px-3 border-b text-center text-xs">Temp. (°C)</th>
                                  <th className="py-2 px-3 border-b text-center text-xs">pH</th>
                                </tr>
                              </thead>
                              <tbody>
                                {report.zones.map((zone, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                    <td className="py-2 px-3 border-b text-xs">Strefa {idx + 1}</td>
                                    <td className="py-2 px-3 border-b text-xs">{zone.product}</td>
                                    <td className="py-2 px-3 border-b text-center text-xs">{zone.concentration}</td>
                                    <td className="py-2 px-3 border-b text-center text-xs">{zone.conductivity}</td>
                                    <td className="py-2 px-3 border-b text-center text-xs">{zone.temperature}</td>
                                    <td className="py-2 px-3 border-b text-center text-xs">{zone.ph}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Wybierz klienta, aby zobaczyć jego raporty</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal dodawania klienta */}
        {showAddClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Dodaj nowego klienta</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa klienta</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Podaj nazwę klienta"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                  onClick={() => setShowAddClientModal(false)}
                >
                  Anuluj
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={addClient}
                >
                  Dodaj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Panel administracyjny
  const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('products');
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Panel Administratora</h2>
        
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 text-sm font-medium ${activeSection === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('products')}
          >
            Zarządzanie Produktami
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${activeSection === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('users')}
          >
            Zarządzanie Użytkownikami
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${activeSection === 'clients' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveSection('clients')}
          >
            Wszyscy Klienci
          </button>
        </div>
        
        {activeSection === 'products' && <ProductManagement />}
        {activeSection === 'users' && <UserManagement />}
        {activeSection === 'clients' && <ClientManagement />}
      </div>
    );
  };// Zarządzanie produktami
  const ProductManagement = () => {
    const [newProduct, setNewProduct] = useState({ name: '', consumption: 0 });
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Dodaj produkt
    const addProduct = async () => {
      if (newProduct.name && newProduct.consumption > 0) {
        try {
          await addDoc(collection(db, "products"), {
            name: newProduct.name,
            consumption: parseFloat(newProduct.consumption),
            createdAt: new Date().toISOString()
          });
          
          // Odśwież produkty
          fetchProducts();
          setNewProduct({ name: '', consumption: 0 });
        } catch (error) {
          console.error("Błąd podczas dodawania produktu:", error);
          alert("Wystąpił błąd podczas dodawania produktu");
        }
      }
    };
    
    // Aktualizuj produkt
    const updateProduct = async () => {
      if (editingProduct && editingProduct.name && editingProduct.consumption > 0) {
        try {
          const productRef = doc(db, "products", editingProduct.id);
          await updateDoc(productRef, {
            name: editingProduct.name,
            consumption: parseFloat(editingProduct.consumption),
            updatedAt: new Date().toISOString()
          });
          
          // Odśwież produkty
          fetchProducts();
          setEditingProduct(null);
        } catch (error) {
          console.error("Błąd podczas aktualizacji produktu:", error);
          alert("Wystąpił błąd podczas aktualizacji produktu");
        }
      }
    };
    
    // Usuń produkt
    const deleteProduct = async (id) => {
      try {
        await deleteDoc(doc(db, "products", id));
        
        // Odśwież produkty
        fetchProducts();
      } catch (error) {
        console.error("Błąd podczas usuwania produktu:", error);
        alert("Wystąpił błąd podczas usuwania produktu");
      }
    };
    
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">Zarządzanie Produktami</h2>
        
        <div className="mb-6 p-4 border rounded-md">
          <h3 className="text-lg font-medium mb-2">Dodaj Nowy Produkt</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Nazwa produktu"
              className="flex-1 p-2 border rounded"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Zużycie g/m²"
              className="md:w-32 p-2 border rounded"
              value={newProduct.consumption || ''}
              onChange={(e) => setNewProduct({...newProduct, consumption: parseFloat(e.target.value)})}
            />
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              onClick={addProduct}
            >
              Dodaj
            </button>
          </div>
        </div>
        
        {editingProduct && (
          <div className="mb-6 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-2">Edytuj Produkt</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Nazwa produktu"
                className="flex-1 p-2 border rounded"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
              />
              <input
                type="number"
                placeholder="Zużycie g/m²"
                className="md:w-32 p-2 border rounded"
                value={editingProduct.consumption || ''}
                onChange={(e) => setEditingProduct({...editingProduct, consumption: parseFloat(e.target.value)})}
              />
              <button 
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={updateProduct}
              >
                Zapisz
              </button>
              <button 
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                onClick={() => setEditingProduct(null)}
              >
                Anuluj
              </button>
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Nazwa Produktu</th>
                <th className="py-2 px-4 border-b text-center">Zużycie (g/m²)</th>
                <th className="py-2 px-4 border-b text-center">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{product.name}</td>
                  <td className="py-2 px-4 border-b text-center">{product.consumption}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <button 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded mr-2"
                      onClick={() => setEditingProduct(product)}
                    >
                      Edytuj
                    </button>
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                      onClick={() => deleteProduct(product.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Zarządzanie użytkownikami
  const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ 
      email: '', 
      password: '', 
      displayName: '', 
      role: 'salesRep' 
    });
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [error, setError] = useState('');
    
    // Pobierz użytkowników
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersData);
      } catch (error) {
        console.error("Błąd podczas pobierania użytkowników:", error);
      }
    };
    
    // Efekt przy pierwszym ładowaniu
    useEffect(() => {
      fetchUsers();
    }, []);
    
    // Dodaj nowego użytkownika
    const addUser = async () => {
      setError('');
      
      if (!newUser.email || !newUser.password || !newUser.displayName) {
        setError('Wypełnij wszystkie pola');
        return;
      }
      
      try {
        const success = await createUser(
          newUser.email, 
          newUser.password, 
          newUser.displayName, 
          newUser.role
        );
        
        if (success) {
          fetchUsers();
          setNewUser({ email: '', password: '', displayName: '', role: 'salesRep' });
          setShowAddUserModal(false);
        } else {
          setError('Wystąpił błąd podczas tworzenia użytkownika');
        }
      } catch (error) {
        console.error("Błąd podczas dodawania użytkownika:", error);
        setError('Wystąpił błąd podczas dodawania użytkownika');
      }
    };
    
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Zarządzanie Użytkownikami</h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            onClick={() => setShowAddUserModal(true)}
          >
            Dodaj Użytkownika
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Nazwa</th>
                <th className="py-2 px-4 border-b text-left">Email</th>
                <th className="py-2 px-4 border-b text-center">Rola</th>
                <th className="py-2 px-4 border-b text-center">Data utworzenia</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{user.displayName}</td>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {user.role === 'admin' ? 'Administrator' : 'Handlowiec'}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Modal dodawania użytkownika */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Dodaj nowego użytkownika</h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Imię i nazwisko</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  placeholder="Podaj imię i nazwisko"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Podaj adres email"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Podaj hasło"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="salesRep">Handlowiec</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Anuluj
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={addUser}
                >
                  Dodaj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Zarządzanie wszystkimi klientami (Admin)
  const ClientManagement = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [reports, setReports] = useState([]);
    const [salesReps, setSalesReps] = useState([]);
    
    // Pobierz wszystkich klientów
    const fetchAllClients = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "clients"));
        const clientsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setClients(clientsData);
      } catch (error) {
        console.error("Błąd podczas pobierania klientów:", error);
      }
    };
    
    // Pobierz handlowców (dla przypisywania klientów)
    const fetchSalesReps = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "salesRep"));
        const querySnapshot = await getDocs(q);
        const salesRepsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          uid: doc.data().uid,
          displayName: doc.data().displayName,
          email: doc.data().email
        }));
        
        setSalesReps(salesRepsData);
      } catch (error) {
        console.error("Błąd podczas pobierania handlowców:", error);
      }
    };
    
    // Pobierz raporty dla wybranego klienta
    const fetchClientReports = async (clientId) => {
      try {
        const q = query(collection(db, "reports"), where("clientId", "==", clientId));
        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sortuj raporty od najnowszego
        reportsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setReports(reportsData);
      } catch (error) {
        console.error("Błąd podczas pobierania raportów:", error);
        setReports([]);
      }
    };
    
    // Przypisz klienta do innego handlowca
    const assignClientToSalesRep = async (clientId, salesRepId) => {
      try {
        const clientRef = doc(db, "clients", clientId);
        await updateDoc(clientRef, {
          salesRepId: salesRepId,
          updatedAt: new Date().toISOString()
        });
        
        // Odśwież listę klientów
        fetchAllClients();
      } catch (error) {
        console.error("Błąd podczas przypisywania klienta:", error);
        alert("Wystąpił błąd podczas przypisywania klienta");
      }
    };
    
    // Efekt przy pierwszym ładowaniu
    useEffect(() => {
      fetchAllClients();
      fetchSalesReps();
    }, []);
    
    // Efekt przy zmianie wybranego klienta
    useEffect(() => {
      if (selectedClient) {
        fetchClientReports(selectedClient.id);
      }
    }, [selectedClient]);
    
    // Pobierz nazwę handlowca na podstawie ID
    const getSalesRepName = (salesRepId) => {
      const salesRep = salesReps.find(rep => rep.uid === salesRepId);
      return salesRep ? salesRep.displayName : 'Nieprzypisany';
    };
    
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Wszyscy Klienci</h3>
        
        <div className="flex flex-col md:flex-row md:space-x-6">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <div className="bg-gray-50 p-3 rounded border max-h-96 overflow-y-auto">
              {clients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Brak klientów</p>
              ) : (
                <div>
                  {clients.map(client => (
                    <div 
                      key={client.id}
                      className={`p-2 mb-2 rounded cursor-pointer ${selectedClient && selectedClient.id === client.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-gray-500">
                        Handlowiec: {getSalesRepName(client.salesRepId)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            {selectedClient ? (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-medium">{selectedClient.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Przypisz do:</span>
                      <select
                        className="p-1 border rounded text-sm"
                        value={selectedClient.salesRepId || ''}
                        onChange={(e) => assignClientToSalesRep(selectedClient.id, e.target.value)}
                      >
                        <option value="">Wybierz handlowca</option>
                        {salesReps.map(rep => (
                          <option key={rep.uid} value={rep.uid}>{rep.displayName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Data utworzenia: {new Date(selectedClient.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <h4 className="text-md font-medium mb-3">Historia raportów</h4>
                {reports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Brak historii raportów</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map(report => (
                      <div key={report.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">Raport z dnia {new Date(report.date).toLocaleDateString()}</h5>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="py-2 px-3 border-b text-left text-xs">Strefa</th>
                                <th className="py-2 px-3 border-b text-left text-xs">Produkt</th>
                                <th className="py-2 px-3 border-b text-center text-xs">Stężenie (%)</th>
                                <th className="py-2 px-3 border-b text-center text-xs">Przewodność</th>
                                <th className="py-2 px-3 border-b text-center text-xs">Temp. (°C)</th>
                                <th className="py-2 px-3 border-b text-center text-xs">pH</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.zones.map((zone, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="py-2 px-3 border-b text-xs">Strefa {idx + 1}</td>
                                  <td className="py-2 px-3 border-b text-xs">{zone.product}</td>
                                  <td className="py-2 px-3 border-b text-center text-xs">{zone.concentration}</td>
                                  <td className="py-2 px-3 border-b text-center text-xs">{zone.conductivity}</td>
                                  <td className="py-2 px-3 border-b text-center text-xs">{zone.temperature}</td>
                                  <td className="py-2 px-3 border-b text-center text-xs">{zone.ph}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Wybierz klienta, aby zobaczyć szczegóły</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderowanie głównego interfejsu
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <img src="/api/placeholder/48/48" alt="Logo" className="mr-3" />
            <h1 className="text-2xl font-bold text-blue-800">Chemical Consumption Calculator for Haug</h1>
          </div>
          
          <div className="mt-4 md:mt-0">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Zalogowany jako: <strong>{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'Administrator' : 'Handlowiec'})</span>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                  onClick={handleLogout}
                >
                  Wyloguj
                </button>
              </div>
            ) : (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={() => setLoginModalOpen(true)}
              >
                Zaloguj się
              </button>
            )}
          </div>
        </div>
        
        <div className="mb-6 bg-white rounded-lg shadow overflow-x-auto">
          <div className="flex border-b overflow-x-auto whitespace-nowrap">
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'chemicalConsumption' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('chemicalConsumption')}
            >
              Zużycie chemii
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'volumeCalculator' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('volumeCalculator')}
            >
              Kalkulator objętości
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'concentrationCalculator' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('concentrationCalculator')}
            >
              Uzupełnianie stężenia
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'coolantSelector' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('coolantSelector')}
            >
              Dobór chłodziw
            </button>
            {currentUser && currentUser.role === 'salesRep' && (
              <button
                className={`py-3 px-6 text-sm font-medium ${activeTab === 'salesRepPanel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('salesRepPanel')}
              >
                Panel handlowca
              </button>
            )}
            {currentUser && currentUser.role === 'admin' && (
              <button
                className={`py-3 px-6 text-sm font-medium ${activeTab === 'adminPanel' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('adminPanel')}
              >
                Panel administratora
              </button>
            )}
          </div>
        </div>
        
        {activeTab === 'chemicalConsumption' && <ChemicalConsumptionCalculator />}
        {activeTab === 'volumeCalculator' && <VolumeCalculator />}
        {activeTab === 'concentrationCalculator' && <ConcentrationCalculator />}
        {activeTab === 'coolantSelector' && <CoolantSelector />}
        {activeTab === 'salesRepPanel' && currentUser && currentUser.role === 'salesRep' && <SalesRepPanel />}
        {activeTab === 'adminPanel' && currentUser && currentUser.role === 'admin' && <AdminPanel />}
        
        {loginModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Logowanie</h2>
              
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
                  {loginError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={loginCredentials.email}
                  onChange={(e) => setLoginCredentials({...loginCredentials, email: e.target.value})}
                  placeholder="Podaj adres email"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded"
                  value={loginCredentials.password}
                  onChange={(e) => setLoginCredentials({...loginCredentials, password: e.target.value})}
                  placeholder="Podaj hasło"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                  onClick={() => setLoginModalOpen(false)}
                >
                  Anuluj
                </button>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  onClick={handleLogin}
                >
                  Zaloguj
                </button>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Dane logowania testowego administratora:</p>
                <p>Email: admin@haug.com, Hasło: admin123</p>
                <p>Dane logowania testowego handlowca:</p>
                <p>Email: sales@haug.com, Hasło: sales123</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="mt-10 text-center text-gray-500 text-sm py-4">
        <p>© 2025 Chemical Consumption Calculator for Haug. Wszelkie prawa zastrzeżone.</p>
        <p className="mt-1">Aplikacja zoptymalizowana do pracy na Netlify</p>
      </footer>
    </div>
  );
};

export default App;
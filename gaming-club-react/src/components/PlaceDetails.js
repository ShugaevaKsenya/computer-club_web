import React from 'react';
import '../styles/PlaceDetails.css';

const PlaceDetails = ({ place, onBack, onSelect }) => {
  // Данные о местах
  const placeData = {
    1: {
      type: "Gaming PC",
      specs: {
        processor: "Intel Core i9-13900K",
        gpu: "NVIDIA RTX 4080",
        monitor: "27\" 240Hz IPS",
        headphones: "HyperX Cloud II",
        mouse: "Razer DeathAdder V3",
        keyboard: "Razer BlackWidow V4"
      },
      price: "100 ₽/час",
      rate: 100 // ДОБАВЬТЕ ЧИСЛОВОЕ ЗНАЧЕНИЕ
    },
    2: {
      type: "Gaming PC", 
      specs: {
        processor: "Intel Core i7-13700K",
        gpu: "NVIDIA RTX 4070 Ti",
        monitor: "27\" 165Hz IPS",
        headphones: "SteelSeries Arctis 5",
        mouse: "Logitech G Pro X",
        keyboard: "Logitech G915"
      },
      price: "90 ₽/час",
      rate: 90
    },
    3: {
      type: "Gaming PC",
      specs: {
        processor: "AMD Ryzen 7 7800X3D",
        gpu: "AMD RX 7900 XT",
        monitor: "32\" 144Hz VA",
        headphones: "Corsair Virtuoso",
        mouse: "SteelSeries Rival 5",
        keyboard: "Corsair K100"
      },
      price: "95 ₽/час",
      rate: 95
    },
    4: {
      type: "Gaming PC",
      specs: {
        processor: "Intel Core i5-13600K",
        gpu: "NVIDIA RTX 4060 Ti",
        monitor: "24\" 144Hz IPS",
        headphones: "Razer Kraken",
        mouse: "Razer Viper Mini",
        keyboard: "Razer Huntsman Mini"
      },
      price: "80 ₽/час",
      rate: 80
    },
    5: {
      type: "Streaming PC",
      specs: {
        processor: "AMD Ryzen 9 7950X",
        gpu: "NVIDIA RTX 4090",
        monitor: "32\" 4K 144Hz",
        headphones: "Beyerdynamic DT 990 Pro",
        mouse: "Logitech MX Master 3",
        keyboard: "Keychron Q6"
      },
      price: "150 ₽/час",
      rate: 150
    },
    6: {
      type: "Competitive PC",
      specs: {
        processor: "Intel Core i9-14900K",
        gpu: "NVIDIA RTX 4080",
        monitor: "25\" 360Hz IPS",
        headphones: "Sennheiser HD 660S",
        mouse: "FinalMouse Starlight-12",
        keyboard: "Wooting 60HE"
      },
      price: "120 ₽/час",
      rate: 120
    },
    8: {
      type: "PlayStation 5",
      specs: {
        console: "PlayStation 5",
        controller: "DualSense Wireless",
        monitor: "55\" 4K HDR TV",
        headphones: "PlayStation Pulse 3D",
        games: "Более 50 игр в библиотеке"
      },
      price: "70 ₽/час",
      rate: 70
    },
    9: {
      type: "PlayStation 5 Pro",
      specs: {
        console: "PlayStation 5 Pro",
        controller: "DualSense Edge",
        monitor: "65\" 4K OLED TV",
        headphones: "SteelSeries Arctis 7P",
        games: "Премиум коллекция игр"
      },
      price: "90 ₽/час",
      rate: 90
    },
    10: {
      type: "VR Station",
      specs: {
        headset: "Meta Quest 3",
        pc: "RTX 4070 + i7-13700",
        space: "4x4m игровая зона",
        accessories: "Полный трекинг тела"
      },
      price: "120 ₽/час",
      rate: 120
    },
    11: {
      type: "Audio Station",
      specs: {
        headphones: "Audeze LCD-X",
        dac: "Schiit Modius",
        amp: "Schiit Asgard 3",
        source: "Tidal HiFi Plus"
      },
      price: "60 ₽/час",
      rate: 60
    },
    12: {
      type: "PlayStation 4 Pro",
      specs: {
        console: "PlayStation 4 Pro",
        controller: "DualShock 4",
        monitor: "43\" 4K TV",
        headphones: "Sony WH-1000XM4",
        games: "Классическая библиотека"
      },
      price: "50 ₽/час",
      rate: 50
    },
    13: {
      type: "Nintendo Switch",
      specs: {
        console: "Nintendo Switch OLED",
        controllers: "Joy-Con + Pro Controller",
        monitor: "50\" 4K TV",
        games: "Все эксклюзивы Nintendo"
      },
      price: "40 ₽/час",
      rate: 40
    },
    14: {
      type: "Premium Audio",
      specs: {
        headphones: "Focal Utopia",
        dac: "Chord Hugo TT2",
        amp: "Feliks Audio Euforia",
        cables: "Cardas Clear Beyond"
      },
      price: "100 ₽/час",
      rate: 100
    }
  };

  const placeInfo = placeData[place] || {
    type: "Стандартное место",
    specs: {},
    price: "80 ₽/час",
    rate: 80
  };

  // Функция для извлечения числового значения из строки цены
  const getRateFromPrice = (priceString) => {
    return placeInfo.rate; // Используем числовое значение из данных
  };

  const handleSelect = () => {
    onSelect(place, placeInfo.rate); // ПЕРЕДАЕМ СТОИМОСТЬ ПРИ ВЫБОРЕ
  };

  return (
    <div className="place-details-overlay">
      <div className="place-details">
        <div className="place-details-header">
          <h2>Место {place}</h2>
          <button className="close-btn" onClick={onBack}>×</button>
        </div>
        
        <div className="place-info">
          <div className="place-type">
            <h3>{placeInfo.type}</h3>
            <div className="place-price">{placeInfo.price}</div>
          </div>
          
          <div className="specs-grid">
            {Object.entries(placeInfo.specs).map(([key, value]) => (
              <div key={key} className="spec-item">
                <span className="spec-label">{getSpecLabel(key)}:</span>
                <span className="spec-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="place-actions">
          <button className="btn secondary" onClick={onBack}>
            Назад к выбору
          </button>
          <button className="btn primary" onClick={handleSelect}>
            Выбрать это место
          </button>
        </div>
      </div>
    </div>
  );
};

// Вспомогательная функция для перевода названий характеристик
const getSpecLabel = (key) => {
  const labels = {
    processor: "Процессор",
    gpu: "Видеокарта",
    monitor: "Монитор",
    headphones: "Наушники",
    mouse: "Мышь",
    keyboard: "Клавиатура",
    console: "Консоль",
    controller: "Контроллер",
    games: "Игры",
    headset: "VR Шлем",
    pc: "ПК для VR",
    space: "Игровая зона",
    accessories: "Аксессуары",
    dac: "ЦАП",
    amp: "Усилитель",
    source: "Источник",
    cables: "Кабели"
  };
  return labels[key] || key;
};

export default PlaceDetails;
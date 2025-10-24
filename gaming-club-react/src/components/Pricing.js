import React from 'react';
import '../styles/Pricing.css';

const Pricing = () => {
  const pricingData = [
    {
      title: "GAME ROOM",
      details: `1 ч. - 100 ₽

3 ч. - 150 ₽

c 08:00 до 14:00
3 ч.  - 240 ₽

Пакет «Ночь» ВС-ЧТ - 350 ₽

Пакет «Ночь» ПТ-СБ - 400 ₽

(Время действия пакета «Ночь» с 23:00 до 08:00)`
    },
    {
      title: "PS4, PS5",
      details: `1 ч. - 100 ₽

3 ч. - 150 ₽

c 08:00 до 14:00
3 ч.  - 240 ₽

Пакет «Ночь» ВС-ЧТ - 350 ₽

Пакет «Ночь» ПТ-СБ - 400 ₽

(Время действия пакета «Ночь» с 23:00 до 08:00)`
    },
    {
      title: "STREAM ROOM",
      details: `1 ч. - 100 ₽

3 ч. - 150 ₽

c 08:00 до 14:00
3 ч.  - 240 ₽

Пакет «Ночь» ВС-ЧТ - 350 ₽

Пакет «Ночь» ПТ-СБ - 400 ₽

(Время действия пакета «Ночь» с 23:00 до 08:00)`
    }
  ];

  const handleClubSelect = () => {
    const clubsSection = document.getElementById('clubs');
    if (clubsSection) {
      clubsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="pricing-section">
      <div className="container">
        <div className="section-title-container pricing-title">
          <h2 className="section-title">Прайс</h2>
        </div>
        <div className="pricing-grid">
          {pricingData.map((price, index) => (
            <article key={index} className="price-card">
              <h3>{price.title}</h3>
              <pre className="price-details">{price.details}</pre>
              <button 
                onClick={handleClubSelect} 
                className="btn"
              >
                Выбрать клуб
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
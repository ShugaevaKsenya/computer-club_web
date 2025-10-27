import React, { useState, useEffect } from 'react';
import { apiService } from '../services/Api';
import '../styles/PlaceDetails.css';

const PlaceDetails = ({ place, onBack, onSelect, positionInfo }) => {
  const [computerDetails, setComputerDetails] = useState(null);
  const [computerSpecs, setComputerSpecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadComputerDetails = async () => {
      if (!positionInfo?.computer?.id) {
        setError('Нет данных о компьютере');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const fullComputer = await apiService.getComputerWithDetails(positionInfo.computer.id);
        const specId = fullComputer.spec_id;
        let specData = null;

        if (specId) {
          try {
            specData = await apiService.getComputerSpec(specId);
          } catch (specErr) {
            console.warn('Не удалось загрузить спецификацию по spec_id:', specId, specErr);
          }
        }

        const hourlyRate = parseFloat(fullComputer.price) || 100;

        const finalSpecs = {
          processor: specData?.processor || fullComputer.processor || 'Не указан',
          gpu: specData?.gpu || fullComputer.gpu || 'Не указана',
          ram: specData?.ram ? `${specData.ram} GB` : (fullComputer.ram ? `${fullComputer.ram} GB` : 'Не указана'),
          monitor: specData?.monitor || fullComputer.monitor || 'Не указан',
          headphones: specData?.headphones || fullComputer.headphones || 'Не указаны',
          keyboard: specData?.keyboard || fullComputer.keyboard || 'Не указана',
          mouse: specData?.mouse || fullComputer.mouse || 'Не указана',
          storage: specData?.storage || fullComputer.storage || 'Не указано',
          motherboard: specData?.motherboard || fullComputer.motherboard || 'Не указана',
          powerSupply: specData?.power_supply || fullComputer.power_supply || 'Не указан',
          cpuCooler: specData?.cpu_cooler || 'Не указан',
          case: specData?.case || 'Не указан',
          networkCard: specData?.network_card || 'Встроенная',
          soundCard: specData?.sound_card || 'Встроенная',
          operatingSystem: specData?.operating_system || 'Windows 10/11'
        };

        setComputerDetails({
          ...fullComputer,
          position: positionInfo.position,
          hourlyRate,
          specs: finalSpecs
        });

        setComputerSpecs(specData); 

      } catch (err) {
        console.error('❌ Ошибка загрузки данных компьютера:', err);
        setError('Не удалось загрузить данные компьютера');
        const fallbackPrice = parseFloat(positionInfo.computer.price) || 100;
        setComputerDetails({
          ...positionInfo.computer,
          position: positionInfo.position,
          hourlyRate: fallbackPrice,
          specs: {
            processor: 'Не указан',
            gpu: 'Не указана',
            ram: 'Не указана',
            monitor: 'Не указан',
            headphones: 'Не указаны',
            keyboard: 'Не указана',
            mouse: 'Не указана',
            storage: 'Не указано',
            motherboard: 'Не указана',
            powerSupply: 'Не указан'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadComputerDetails();
  }, [positionInfo]);

  const calculatedRate = computerDetails?.hourlyRate || 100;

  if (!positionInfo) {
    return (
      <div className="place-details-overlay">
        <div className="place-details">
          <h2>Ошибка загрузки данных</h2>
          <p>Не удалось загрузить информацию о месте.</p>
          <button onClick={onBack} className="btn secondary">Назад</button>
        </div>
      </div>
    );
  }

  return (
    <div className="place-details-overlay">
      <div className="place-details">
        <div className="place-details-header">
          <h2>Место №{place}</h2>
          <button onClick={onBack} className="close-btn">×</button>
        </div>

        <div className="place-info">
          {loading && (
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>Загрузка технических характеристик...</p>
            </div>
          )}

          {error && (
            <div className="error-section">
              <span className="error-icon"></span>
              <p>{error}</p>
            </div>
          )}

          <div className="info-section">
            <h3>Информация о позиции</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Комната:</span>
                <span className="value">{positionInfo.room || 'Не указана'}</span>
              </div>
              <div className="info-item">
                <span className="label">Номер места:</span>
                <span className="value">{positionInfo.number || place}</span>
              </div>
              <div className="info-item">
                <span className="label">Position ID:</span>
                <span className="value">{positionInfo.position?.id || 'Не указан'}</span>
              </div>
            </div>
          </div>

          {computerDetails && (
            <>
              <div className="info-section">
                <h3>Основная информация</h3>
                <div className="info-grid">
                  <div className="info-item highlight">
                    <span className="label">Стоимость:</span>
                    <span className="value price">{calculatedRate} ₽/час</span>
                  </div>
                  <div className="info-item">
                    <span className="label">ID компьютера:</span>
                    <span className="value">{computerDetails.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Название:</span>
                    <span className="value">{computerDetails.name || `Компьютер ${computerDetails.id}`}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Статус:</span>
                    <span className={`value status ${computerDetails.status || 'active'}`}>
                      {computerDetails.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>
              </div>

              {computerDetails.specs && !loading && (
                <div className="info-section">
                  <h3>Технические характеристики</h3>
                  <div className="specs-source-info">
                    {computerSpecs ? (
                      <span className="source-api">Данные загружены из API</span>
                    ) : (
                      <span className="source-fallback">Используются базовые данные</span>
                    )}
                  </div>

                  <div className="specs-grid">
                    {/* Основные компоненты */}
                    <div className="spec-category">
                      <h4>Основные компоненты</h4>
                      <div className="specs-list">
                        {Object.entries({
                          'Процессор': computerDetails.specs.processor,
                          'Видеокарта': computerDetails.specs.gpu,
                          'Оперативная память': computerDetails.specs.ram,
                          'Накопитель': computerDetails.specs.storage,
                          'Материнская плата': computerDetails.specs.motherboard,
                        }).map(([label, value]) => (
                          <div className="spec-item" key={label}>
                        
                            <div className="spec-content">
                              <span className="spec-label">{label}</span>
                              <span className="spec-value">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Периферия и охлаждение */}
                    <div className="spec-category">
                      <h4>Периферия и охлаждение</h4>
                      <div className="specs-list">
                        {Object.entries({
                          'Монитор': computerDetails.specs.monitor,
                          'Наушники': computerDetails.specs.headphones,
                          'Клавиатура': computerDetails.specs.keyboard,
                          'Мышь': computerDetails.specs.mouse,
                          'Охлаждение CPU': computerDetails.specs.cpuCooler,
                        }).map(([label, value]) => (
                          <div className="spec-item" key={label}>
                        
                            <div className="spec-content">
                              <span className="spec-label">{label}</span>
                              <span className="spec-value">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Дополнительные компоненты */}
                    <div className="spec-category">
                      <h4>Дополнительные компоненты</h4>
                      <div className="specs-list">
                        {Object.entries({
                          'Блок питания': computerDetails.specs.powerSupply,
                          'Корпус': computerDetails.specs.case,
                          'Сетевая карта': computerDetails.specs.networkCard,
                          'Звуковая карта': computerDetails.specs.soundCard,
                          'Операционная система': computerDetails.specs.operatingSystem,
                        }).map(([label, value]) => (
                          <div className="spec-item" key={label}>
                
                            <div className="spec-content">
                              <span className="spec-label">{label}</span>
                              <span className="spec-value">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="info-section availability">
            <h3>Статус доступности</h3>
            <div className="availability-info">
              <div className="availability-item available">
                <span className="availability-dot"></span>
                <span className="availability-text">Место доступно для бронирования</span>
              </div>
              <div className="availability-item">
                <span className="availability-info-text">Минимальное время брони: 30 минут</span>
              </div>
              <div className="availability-item">
                <span className="availability-info-text">Максимальное время брони: 24 часа</span>
              </div>
              <div className="availability-item">
                <span className="availability-info-text">Стоимость: {calculatedRate} ₽/час</span>
              </div>
            </div>
          </div>
        </div>

        <div className="place-actions">
          <button 
            onClick={() => onSelect(place, calculatedRate)}
            className="btn primary select-btn"
            disabled={loading}
          >
            <span className="btn-icon"></span>
            {loading ? 'Загрузка...' : 'Выбрать это место'}
            <span className="price-badge">{calculatedRate} ₽/час</span>
          </button>
          <button onClick={onBack} className="btn secondary" disabled={loading}>
            <span className="btn-icon">↩</span>
            Назад к выбору
          </button>
        </div>

        {computerSpecs && (
          <div className="additional-info">
            <p className="info-note">
              <strong>Технические данные:</strong> Актуальные характеристики загружены из системы.
              Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetails;
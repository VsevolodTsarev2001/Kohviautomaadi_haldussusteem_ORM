import React, { useState, useEffect } from 'react';
import "../App.css";
import { API_BASE_URL } from "../config";


const PromocodeManager = () => {
    const [promocodes, setPromocodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPromocode, setEditingPromocode] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discountPercent: 0,
        discountAmount: 0,
        validFrom: '',
        validTo: '',
        maxUsageCount: '',
        minOrderAmount: '',
        isActive: true
    });

    useEffect(() => {
        loadPromocodes();
    }, []);

    const loadPromocodes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/Promocodes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPromocodes(data);
            }
        } catch (error) {
            console.error('Viga sooduskoodide laadimisel:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        const url = editingPromocode
            ? `${API_BASE_URL}/Promocodes/${editingPromocode.id}`
            : `${API_BASE_URL}/Promocodes`;
        
        const method = editingPromocode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    discountPercent: parseFloat(formData.discountPercent) || 0,
                    discountAmount: parseFloat(formData.discountAmount) || 0,
                    maxUsageCount: formData.maxUsageCount ? parseInt(formData.maxUsageCount) : null,
                    minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null
                })
            });

            if (response.ok) {
                alert(editingPromocode ? 'Sooduskood uuendatud!' : 'Sooduskood loodud!');
                loadPromocodes();
                resetForm();
            } else {
                const error = await response.json();
                alert(error.message || 'Viga sooduskoodi salvestamisel');
            }
        } catch (error) {
            console.error('Viga:', error);
            alert('Viga sooduskoodi salvestamisel');
        }
    };

    const handleEdit = (promocode) => {
        setEditingPromocode(promocode);
        setFormData({
            code: promocode.code,
            discountPercent: promocode.discountPercent,
            discountAmount: promocode.discountAmount,
            validFrom: promocode.validFrom ? promocode.validFrom.split('T')[0] : '',
            validTo: promocode.validTo ? promocode.validTo.split('T')[0] : '',
            maxUsageCount: promocode.maxUsageCount || '',
            minOrderAmount: promocode.minOrderAmount || '',
            isActive: promocode.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Kas kustutada see sooduskood?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/Promocodes/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Sooduskood kustutatud!');
                loadPromocodes();
            }
        } catch (error) {
            console.error('Viga kustutamisel:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountPercent: 0,
            discountAmount: 0,
            validFrom: '',
            validTo: '',
            maxUsageCount: '',
            minOrderAmount: '',
            isActive: true
        });
        setEditingPromocode(null);
        setShowForm(false);
    };

    if (loading) {
        return <div style={styles.loading}>⏳ Sooduskoodide laadimine...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>🎫 Sooduskoodide haldus</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={styles.addButton}
                >
                    {showForm ? '❌ Tühista' : '➕ Loo sooduskood'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGrid}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Sooduskoodi kood *</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                required
                                style={styles.input}
                                placeholder="SUMMER2024"
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Allahindlus % (kui 0, siis kasutatakse fikseeritud)</label>
                            <input
                                type="number"
                                name="discountPercent"
                                value={formData.discountPercent}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                step="0.01"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Fikseeritud allahindlus €</label>
                            <input
                                type="number"
                                name="discountAmount"
                                value={formData.discountAmount}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Kehtib alates</label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleInputChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Kehtib kuni</label>
                            <input
                                type="date"
                                name="validTo"
                                value={formData.validTo}
                                onChange={handleInputChange}
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Maks. kasutusi (tühi = ∞)</label>
                            <input
                                type="number"
                                name="maxUsageCount"
                                value={formData.maxUsageCount}
                                onChange={handleInputChange}
                                min="1"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Min. tellimuse summa €</label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                style={styles.input}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    style={styles.checkbox}
                                />
                                Aktiivne
                            </label>
                        </div>
                    </div>

                    <div style={styles.formActions}>
                        <button type="submit" style={styles.saveButton}>
                            💾 {editingPromocode ? 'Uuenda' : 'Loo'}
                        </button>
                        <button type="button" onClick={resetForm} style={styles.cancelButton}>
                            Tühista
                        </button>
                    </div>
                </form>
            )}

            <div style={styles.promocodesList}>
                {promocodes.map(promo => (
                    <div key={promo.id} style={styles.promocodeCard}>
                        <div style={styles.promocodeHeader}>
                            <span style={{
                                ...styles.promocodeCode,
                                backgroundColor: promo.isActive ? '#28a745' : '#6c757d'
                            }}>
                                {promo.code}
                            </span>
                            {!promo.isActive && <span style={styles.inactiveBadge}>Mitteaktiivne</span>}
                        </div>

                        <div style={styles.promocodeBody}>
                            <div style={styles.promocodeInfo}>
                                <span style={styles.discountValue}>
                                    {promo.discountPercent > 0
                                        ? `${promo.discountPercent}% allahindlus`
                                        : `€${promo.discountAmount.toFixed(2)} allahindlus`
                                    }
                                </span>
                            </div>

                            <div style={styles.promocodeDetails}>
                                {promo.minOrderAmount && (
                                    <div style={styles.detailItem}>
                                        📊 Min. tellimus: €{promo.minOrderAmount.toFixed(2)}
                                    </div>
                                )}
                                {promo.validFrom && (
                                    <div style={styles.detailItem}>
                                        📅 С: {new Date(promo.validFrom).toLocaleDateString('ru-RU')}
                                    </div>
                                )}
                                {promo.validTo && (
                                    <div style={styles.detailItem}>
                                        📅 До: {new Date(promo.validTo).toLocaleDateString('ru-RU')}
                                    </div>
                                )}
                                <div style={styles.detailItem}>
                                    🎯 Использований: {promo.usageCount}
                                    {promo.maxUsageCount ? ` / ${promo.maxUsageCount}` : ' / ∞'}
                                </div>
                            </div>
                        </div>

                        <div style={styles.promocodeActions}>
                            <button
                                onClick={() => handleEdit(promo)}
                                style={styles.editButton}
                            >
                                ✏️ Изменить
                            </button>
                            <button
                                onClick={() => handleDelete(promo.id)}
                                style={styles.deleteButton}
                            >
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '20px auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0
    },
    addButton: {
        padding: '10px 20px',
        fontSize: '16px',
        fontWeight: '600',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    loading: {
        textAlign: 'center',
        fontSize: '20px',
        padding: '50px',
        color: '#7f8c8d'
    },
    form: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#495057'
    },
    input: {
        padding: '10px',
        fontSize: '14px',
        border: '2px solid #dee2e6',
        borderRadius: '8px',
        outline: 'none'
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#495057',
        cursor: 'pointer'
    },
    checkbox: {
        width: '20px',
        height: '20px',
        cursor: 'pointer'
    },
    formActions: {
        display: 'flex',
        gap: '10px'
    },
    saveButton: {
        padding: '12px 30px',
        fontSize: '16px',
        fontWeight: '600',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    cancelButton: {
        padding: '12px 30px',
        fontSize: '16px',
        fontWeight: '600',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    promocodesList: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '20px'
    },
    promocodeCard: {
        border: '2px solid #dee2e6',
        borderRadius: '10px',
        padding: '20px',
        backgroundColor: 'white',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    promocodeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    promocodeCode: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        padding: '5px 15px',
        borderRadius: '8px'
    },
    inactiveBadge: {
        fontSize: '12px',
        padding: '3px 8px',
        backgroundColor: '#dc3545',
        color: 'white',
        borderRadius: '5px'
    },
    promocodeBody: {
        marginBottom: '15px'
    },
    promocodeInfo: {
        marginBottom: '10px'
    },
    discountValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#007bff'
    },
    promocodeDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    },
    detailItem: {
        fontSize: '14px',
        color: '#495057'
    },
    promocodeActions: {
        display: 'flex',
        gap: '10px',
        paddingTop: '15px',
        borderTop: '1px solid #dee2e6'
    },
    editButton: {
        flex: 1,
        padding: '8px',
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: '#ffc107',
        color: '#212529',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    deleteButton: {
        flex: 1,
        padding: '8px',
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    }
};

export default PromocodeManager;

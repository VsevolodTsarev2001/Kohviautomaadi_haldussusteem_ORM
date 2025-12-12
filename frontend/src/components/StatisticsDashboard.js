import React, { useState, useEffect } from 'react';
import "../App.css";
import { API_BASE_URL } from "../config";


const StatisticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        return new Date().toISOString().split('T')[0];
    });

    useEffect(() => {
        loadStatistics();
    }, [fromDate, toDate]);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_BASE_URL}/Statistics/dashboard?fromDate=${fromDate}&toDate=${toDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={styles.loading}>⏳ Загрузка статистики...</div>;
    }

    if (!stats) {
        return <div style={styles.error}>❌ Не удалось загрузить статистику</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>📊 Панель статистики</h2>

            {/* Фильтры по датам */}
            <div style={styles.filters}>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>С даты:</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        style={styles.dateInput}
                    />
                </div>
                <div style={styles.filterGroup}>
                    <label style={styles.label}>По дату:</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        style={styles.dateInput}
                    />
                </div>
                <button onClick={loadStatistics} style={styles.refreshButton}>
                    🔄 Uuenda
                </button>
            </div>

            {/* Üldine statistika */}
            <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryIcon}>📦</div>
                    <div style={styles.summaryValue}>{stats.summary.totalOrders}</div>
                    <div style={styles.summaryLabel}>Tellimusi kokku</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryIcon}>💰</div>
                    <div style={styles.summaryValue}>€{stats.summary.totalRevenue.toFixed(2)}</div>
                    <div style={styles.summaryLabel}>Käive kokku</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.summaryIcon}>📈</div>
                    <div style={styles.summaryValue}>€{stats.summary.averageOrderValue.toFixed(2)}</div>
                    <div style={styles.summaryLabel}>Keskmine tellimus</div>
                </div>
            </div>

            {/* Populaarsed joogid */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🔥 Top-5 populaarsed joogid</h3>
                <div style={styles.table}>
                    <div style={styles.tableHeader}>
                        <div style={styles.tableCell}>Jook</div>
                        <div style={styles.tableCell}>Tellimusi</div>
                        <div style={styles.tableCell}>Hind</div>
                        <div style={styles.tableCell}>Käive</div>
                    </div>
                    {stats.popularDrinks.map((drink, index) => (
                        <div key={drink.id} style={styles.tableRow}>
                            <div style={styles.tableCell}>
                                <span style={styles.rank}>#{index + 1}</span> {drink.joogiNimi}
                            </div>
                            <div style={styles.tableCell}>{drink.orderCount}</div>
                            <div style={styles.tableCell}>€{drink.price.toFixed(2)}</div>
                            <div style={styles.tableCell}>€{drink.revenue.toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Продажи по дням */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📅 Продажи за последние 7 дней</h3>
                <div style={styles.chartContainer}>
                    {stats.salesByDay.map((day) => {
                        const maxRevenue = Math.max(...stats.salesByDay.map(d => d.revenue));
                        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                        return (
                            <div key={day.date} style={styles.barWrapper}>
                                <div style={styles.barValue}>€{day.revenue.toFixed(0)}</div>
                                <div style={styles.bar}>
                                    <div 
                                        style={{
                                            ...styles.barFill,
                                            height: `${height}%`
                                        }}
                                    />
                                </div>
                                <div style={styles.barLabel}>
                                    {new Date(day.date).toLocaleDateString('ru-RU', { 
                                        day: '2-digit', 
                                        month: 'short' 
                                    })}
                                </div>
                                <div style={styles.barCount}>{day.orderCount} зак.</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Statistika staatuste järgi */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📊 Tellimused staatuste järgi</h3>
                <div style={styles.statusGrid}>
                    {stats.ordersByStatus.map((status) => (
                        <div key={status.status} style={styles.statusCard}>
                            <div style={styles.statusCount}>{status.count}</div>
                            <div style={styles.statusLabel}>{status.status}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top kliendid */}
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>👥 Top-5 kliendid</h3>
                <div style={styles.table}>
                    <div style={styles.tableHeader}>
                        <div style={styles.tableCell}>Klient</div>
                        <div style={styles.tableCell}>Email</div>
                        <div style={styles.tableCell}>Tellimusi</div>
                        <div style={styles.tableCell}>Kulutatud</div>
                    </div>
                    {stats.topCustomers.map((customer, index) => (
                        <div key={customer.userId} style={styles.tableRow}>
                            <div style={styles.tableCell}>
                                <span style={styles.rank}>#{index + 1}</span> {customer.userName}
                            </div>
                            <div style={styles.tableCell}>{customer.userEmail}</div>
                            <div style={styles.tableCell}>{customer.orderCount}</div>
                            <div style={styles.tableCell}>€{customer.totalSpent.toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '30px',
        color: '#2c3e50',
        textAlign: 'center'
    },
    loading: {
        textAlign: 'center',
        fontSize: '24px',
        padding: '50px',
        color: '#7f8c8d'
    },
    error: {
        textAlign: 'center',
        fontSize: '20px',
        padding: '50px',
        color: '#e74c3c'
    },
    filters: {
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        alignItems: 'flex-end'
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#495057'
    },
    dateInput: {
        padding: '10px 15px',
        fontSize: '14px',
        border: '2px solid #dee2e6',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.3s'
    },
    refreshButton: {
        padding: '10px 20px',
        fontSize: '14px',
        fontWeight: '600',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
    },
    summaryCard: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        transition: 'transform 0.3s'
    },
    summaryIcon: {
        fontSize: '48px',
        marginBottom: '15px'
    },
    summaryValue: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '10px'
    },
    summaryLabel: {
        fontSize: '14px',
        color: '#7f8c8d',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    section: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#2c3e50'
    },
    table: {
        width: '100%'
    },
    tableHeader: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: '10px'
    },
    tableRow: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        padding: '15px',
        borderBottom: '1px solid #e9ecef',
        alignItems: 'center'
    },
    tableCell: {
        fontSize: '14px',
        color: '#495057'
    },
    rank: {
        display: 'inline-block',
        backgroundColor: '#007bff',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginRight: '8px'
    },
    chartContainer: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: '300px',
        padding: '20px 0',
        gap: '10px'
    },
    barWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1
    },
    barValue: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px'
    },
    bar: {
        width: '100%',
        height: '200px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px 8px 0 0',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end'
    },
    barFill: {
        width: '100%',
        backgroundColor: '#007bff',
        borderRadius: '8px 8px 0 0',
        transition: 'height 0.3s ease'
    },
    barLabel: {
        marginTop: '8px',
        fontSize: '12px',
        color: '#495057',
        fontWeight: '600'
    },
    barCount: {
        fontSize: '11px',
        color: '#7f8c8d',
        marginTop: '4px'
    },
    statusGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
    },
    statusCard: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        textAlign: 'center',
        border: '2px solid #dee2e6'
    },
    statusCount: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: '10px'
    },
    statusLabel: {
        fontSize: '14px',
        color: '#495057',
        fontWeight: '600'
    }
};

export default StatisticsDashboard;

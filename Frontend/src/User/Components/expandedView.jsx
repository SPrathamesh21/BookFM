import React from 'react';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        padding: '30px',
        borderRadius: '12px',
        background: 'linear-gradient(145deg, #f0f0f0, #ffffff)',
        maxWidth: '1000px',
        margin: '20px auto',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        overflow: 'hidden',
    },
    coverImage: {
        width: '300px',
        height: '400px',
        marginRight: '30px',
        borderRadius: '12px',
        objectFit: 'cover',
        transition: 'transform 0.3s ease',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: 'calc(100% - 350px)',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: '10px',
        color: '#222',
        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.1)',
    },
    author: {
        fontSize: '22px',
        fontStyle: 'italic',
        marginBottom: '15px',
        color: '#555',
    },
    description: {
        fontSize: '18px',
        marginBottom: '20px',
        color: '#666',
        lineHeight: '1.6',
        maxHeight: '120px',
        overflowY: 'auto',
    },
    timeToRead: {
        fontSize: '16px',
        color: '#777',
    },
};

// Add hover effect for better interactivity
const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'scale(1.02)';
    e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.4)';
};

const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.querySelector('img').style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.3)';
};

export default function EnhancedExpandedView() {
    return (
        <div 
            style={styles.container}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            
        >
            <img 
                src="https://via.placeholder.com/300x400" 
                alt="Book Cover" 
                style={styles.coverImage}
            />
            <div  style={styles.details}>
                <h2 style={styles.title}>Book Name</h2>
                <h4 style={styles.author}>by Author Name</h4>
                <p style={styles.description}>
                    This is a brief description of the book. It gives a short overview of the plot, themes, and any other relevant information.
                </p>
                <p style={styles.timeToRead}>Usual time to read: 5 hours</p>
            </div>
        </div>
    );
}

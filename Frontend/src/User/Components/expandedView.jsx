import React from 'react';
import { FaShareAlt, FaBookOpen } from 'react-icons/fa';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '1000px',
        margin: '20px auto',
        background: '#ffffff', // White background
        border: '1px solid #e0e0e0', // Light gray border
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)', // Light shadow for subtle depth
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        overflow: 'hidden',
        position: 'relative',
    },
    coverImage: {
        width: '300px',
        height: '400px',
        marginRight: '30px',
        borderRadius: '8px',
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
        fontSize: '36px', // Larger font size for the title
        fontWeight: '700',
        marginBottom: '10px',
        color: '#333333', // Dark gray for title
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', // Subtle shadow for readability
    },
    author: {
        fontSize: '22px', // Slightly larger font size for the author
        fontStyle: 'italic',
        marginBottom: '15px',
        color: '#555555', // Medium gray for author
    },
    description: {
        fontSize: '18px',
        marginBottom: '20px',
        color: '#666666', // Light gray for description
        lineHeight: '1.6',
        maxHeight: '120px',
        overflowY: 'auto',
    },
    timeToRead: {
        fontSize: '16px',
        color: '#777777', // Very light gray for time to read
    },
    shareButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#007bff', // Bootstrap primary blue
        color: '#ffffff', // White icon color
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Light shadow for button
        transition: 'background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease', // Add transition for hover effect
    },
    shareButtonHover: {
        background: '#0056b3', // Darker blue on hover
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Slightly stronger shadow on hover
    },
    readButton: {
        marginTop: '20px',
        padding: '10px 20px',
        background: '#007bff', // Bootstrap primary blue
        color: '#ffffff', // White text color
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.3s ease, transform 0.3s ease', // Add transition for hover effect
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    readButtonHover: {
        background: '#0056b3', // Darker blue on hover
        transform: 'scale(1.1)', // Slightly enlarge button on hover
    },
};

// Add hover effect for better interactivity
const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'scale(1.02)';
    e.currentTarget.querySelector('img').style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)'; // Slightly stronger shadow on hover
};

const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.querySelector('img').style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
};

// Function to handle sharing
const handleShare = () => {
    const url = window.location.href; // Get the current URL

    if (navigator.share) {
        navigator.share({
            title: 'Book Name',
            text: 'Check out this book!',
            url: url,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
        // Fallback for browsers that don't support the share API
        alert('Sharing not supported on this browser.');
    }
};

export default function EnhancedExpandedView() {
    const [isHover, setIsHover] = React.useState(false);
    const [isReadHover, setIsReadHover] = React.useState(false);

    return (
        <div 
            style={styles.container}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button 
                style={{
                    ...styles.shareButton,
                    ...(isHover ? styles.shareButtonHover : {})
                }}
                onClick={handleShare}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                <FaShareAlt size={20} />
            </button>
            <img 
                src="https://via.placeholder.com/300x400" 
                alt="Book Cover" 
                style={styles.coverImage}
            />
            <div style={styles.details}>
                <h2 style={styles.title}>Book Name</h2>
                <h4 style={styles.author}>by Author Name</h4>
                <p style={styles.description}>
                    This is a brief description of the book. It gives a short overview of the plot, themes, and any other relevant information.
                </p>
                <p style={styles.timeToRead}>Usual time to read: 5 hours</p>
                <button 
                    style={{
                        ...styles.readButton,
                        ...(isReadHover ? styles.readButtonHover : {})
                    }}
                    onMouseEnter={() => setIsReadHover(true)}
                    onMouseLeave={() => setIsReadHover(false)}
                >
                    <FaBookOpen size={18} style={{ marginRight: '8px' }} />
                    Read
                </button>
            </div>
        </div>
    );
}

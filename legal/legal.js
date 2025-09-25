// Legal page JavaScript for dynamic content loading and metadata
import { CANONICAL_PRIVACY_URL, COMMIT_HASH, LAST_UPDATED } from './legalMeta.js';

// Initialize legal page
document.addEventListener('DOMContentLoaded', function() {
    bindMetadata();
    loadLegalContent();
    setupNavigation();
});

function bindMetadata() {
    // Set last updated date
    const dateElement = document.querySelector('[data-bind="legal-date"]');
    if (dateElement) {
        dateElement.textContent = LAST_UPDATED;
    }
    
    // Set commit hash
    const commitElement = document.querySelector('[data-bind="legal-commit"]');
    if (commitElement && COMMIT_HASH) {
        commitElement.textContent = COMMIT_HASH.slice(0, 7);
    }
    
    // Set current year
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Set canonical privacy URL
    const canonicalUrlElement = document.getElementById('canonical-privacy-url');
    if (canonicalUrlElement) {
        canonicalUrlElement.href = CANONICAL_PRIVACY_URL;
        canonicalUrlElement.textContent = CANONICAL_PRIVACY_URL;
    }
}

async function loadLegalContent() {
    const contentSections = [
        { id: 'privacy-body', file: '../privacy-policy.md' },
        { id: 'terms-body', file: '../terms-and-conditions.md' },
        { id: 'gdpr-body', file: '../eu-uk-gdpr-addendum.md' },
        { id: 'ccpa-body', file: '../us-ccpa-cpra-supplemental.md' }
    ];
    
    for (const section of contentSections) {
        await loadSection(section.id, section.file);
    }
}

async function loadSection(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.status}`);
        }
        
        const text = await response.text();
        element.innerHTML = markdownToHTML(text);
    } catch (error) {
        console.error(`Error loading ${filePath}:`, error);
        element.innerHTML = `
            <div style="color: #e74c3c; padding: 20px; text-align: center; border: 1px solid #e74c3c; border-radius: 5px;">
                <p><strong>Content Unavailable</strong></p>
                <p>Unable to load content from ${filePath}</p>
                <p><a href="${filePath}" target="_blank" rel="noopener">View original file</a></p>
            </div>
        `;
    }
}

// Minimal markdown to HTML converter
function markdownToHTML(markdown) {
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        
        // Bold and italic
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        
        // Code
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        
        // Line breaks and paragraphs
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        
        // Lists
        .replace(/^- (.*)$/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
        
        // Tables (basic support)
        .replace(/\|([^|]+)\|/g, '<td>$1</td>')
        .replace(/(<td>.*<\/td>)/g, '<tr>$1</tr>')
        .replace(/(<tr>.*<\/tr>)/g, '<table>$1</table>')
        
        // Wrap in paragraphs
        .replace(/^(?!<[h|u|t])/gim, '<p>')
        .replace(/$/gim, '</p>')
        
        // Clean up extra paragraph tags
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<[h|u|t|d])/g, '$1')
        .replace(/(<\/[h|u|t|d]>)<\/p>/g, '$1');
    
    // Clean up nested lists and tables
    html = html.replace(/<ul>(<ul>.*<\/ul>)<\/ul>/g, '$1');
    html = html.replace(/<table>(<table>.*<\/table>)<\/table>/g, '$1');
    
    return html;
}

function setupNavigation() {
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('.legal-nav a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without triggering a page reload
                history.replaceState(null, null, '#' + targetId);
                
                // Add temporary highlight
                targetElement.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                setTimeout(() => {
                    targetElement.style.backgroundColor = '';
                }, 2000);
            }
        });
    });
    
    // Handle direct anchor navigation on page load
    if (window.location.hash) {
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);
    }
}

// Export for potential use by other scripts
export { loadSection, markdownToHTML };
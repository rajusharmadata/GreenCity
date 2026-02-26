import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../features/auth/context/authcontext';

const IssuesContext = createContext(null);

export function useIssues() {
    const ctx = useContext(IssuesContext);
    if (!ctx) throw new Error('useIssues must be used inside IssuesProvider');
    return ctx;
}

export function IssuesProvider({ children }) {
    const { currentUser } = useAuth();
    const [issues, setIssues] = useState([]);           // community-wide
    const [userIssues, setUserIssues] = useState([]);   // this user's open reports
    const [resolvedIssues, setResolvedIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const fetchIssues = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        setError('');
        try {
            const [communityRes, userRes, resolvedRes] = await Promise.allSettled([
                axiosInstance.get(API_ENDPOINTS.GET_ALL_ISSUES),
                axiosInstance.get(API_ENDPOINTS.GET_USER_ISSUES),
                axiosInstance.get(API_ENDPOINTS.USER_RESOLVED_ISSUES).catch(() => ({ data: [] })),
            ]);

            if (!mountedRef.current) return;

            if (communityRes.status === 'fulfilled') {
                setIssues(communityRes.value.data || []);
            }
            if (userRes.status === 'fulfilled') {
                setUserIssues(userRes.value.data || []);
            }
            if (resolvedRes.status === 'fulfilled') {
                setResolvedIssues(resolvedRes.value.data || []);
            }
        } catch (err) {
            if (mountedRef.current) setError('Failed to load issues.');
            console.error(err);
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const value = {
        issues,
        userIssues,
        resolvedIssues,
        loading,
        error,
        refresh: fetchIssues,
    };

    return (
        <IssuesContext.Provider value={value}>
            {children}
        </IssuesContext.Provider>
    );
}

export default IssuesContext;

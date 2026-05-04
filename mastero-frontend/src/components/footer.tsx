"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from "@/src/i18n/routing"
import { useTranslations } from 'next-intl'
import { Hammer, Send, Mail, Phone, Globe } from "lucide-react"

import { useGetMeQuery } from "@/src/store/api/authApi"

const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
}

export function Footer() {
    const t = useTranslations('Footer')
    const currentYear = new Date().getFullYear()
    
    const { data: user, isLoading } = useGetMeQuery(undefined, {
        skip: typeof window !== 'undefined' && !localStorage.getItem('token')
    })

    return (
        <footer className="relative bg-[#F8FAFC] dark:bg-[#020617] border-t border-slate-200 dark:border-slate-800/50 pt-24 pb-12 overflow-hidden transition-colors duration-500">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] pointer-events-none" />

            <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="max-w-7xl mx-auto px-6 relative z-10"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

                    <motion.div variants={containerVariants} className="space-y-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div 
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="bg-indigo-600 p-2 rounded-[10px] shadow-lg shadow-indigo-600/20"
                            >
                                <Hammer className="h-6 w-6 text-white" />
                            </motion.div>
                            <span className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Mastero</span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg font-medium">
                            {t('description')}
                        </p>

                        <div className="flex gap-3">
                            {[
                                {
                                    id: 'ig', icon: (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                    )
                                },
                                { id: 'tg', icon: <Send size={20} /> },
                                {
                                    id: 'fb', icon: (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                    )
                                }
                            ].map((social) => (
                                <motion.div key={social.id} whileHover={{ y: -5 }}>
                                    <Link
                                        href="#"
                                        className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all block"
                                    >
                                        {social.icon}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div variants={containerVariants}>
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-8 tracking-tight">{t('links')}</h4>
                        <ul className="space-y-4">
                            {['home', 'search', 'register-worker'].map((item) => (
                                <li key={item}>
                                    <Link href={item === 'home' ? '/' : `/${item}`} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center group text-sm font-medium">
                                        <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300 text-indigo-500 opacity-0 group-hover:opacity-100">•</span>
                                        {t(item)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <motion.div variants={containerVariants}>
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg mb-8 tracking-tight">{t('support')}</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('privacy')}</Link></li>
                            <li><Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">{t('terms')}</Link></li>
                            <li><Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</Link></li>
                        </ul>
                    </motion.div>

                    <motion.div variants={containerVariants} className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none p-6 rounded-[2rem] space-y-6">
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">{t('contact')}</h4>
                        <div className="space-y-4">
                            <a href="mailto:info@mastero.tj" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors group">
                                <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                    <Mail size={18} className="text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <span className="text-sm">info@mastero.tj</span>
                            </a>
                            <a href="tel:+992900000000" className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors group">
                                <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                                    <Phone size={18} className="text-indigo-500 dark:text-indigo-400" />
                                </div>
                                <span className="text-sm">+992 900 000 000</span>
                            </a>
                        </div>
                    </motion.div>
                </div>

                <div className="pt-12 border-t border-slate-200 dark:border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-400 dark:text-slate-500 text-sm font-medium">
                        © {currentYear} <span className="text-slate-700 dark:text-slate-300">Mastero</span>. {t('rights')}.
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            <Globe size={14} className="text-indigo-500" />
                            <span>Tajikistan</span>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                        <div className="text-xs font-medium text-slate-400 dark:text-slate-600 italic">
                            Crafted with precision
                        </div>
                    </div>
                </div>
            </motion.div>
        </footer>
    )
}

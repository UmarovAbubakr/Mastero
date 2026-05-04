"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Search,
  Hammer,
  Users,
  Star,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Wrench,
  Droplets,
  Activity,
  Sofa,
  ClipboardList,
  UserRound,
  PhoneCall,
  Loader2,
} from "lucide-react";
import { Link, useRouter } from "@/src/i18n/routing";
import { useGetTopWorkersQuery } from "@/src/store/api/workerApi";
import { useTranslations } from "next-intl";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  },
};

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("");
  const t = useTranslations('Home');
  const ts = useTranslations('Search');
  const tJobs = useTranslations('Jobs');
  const router = useRouter();
  const { data: topWorkers = [], isLoading: loading } = useGetTopWorkersQuery(4);

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleCategoryClick = (category: string) => {
    setSearchValue(category);
    router.push(`/search?query=${encodeURIComponent(category)}`);
  };

  const popularCategories = [
    { id: 'plumber', name: ts("cat_plumber"), icon: Droplets },
    { id: 'electrician', name: ts("cat_electrician"), icon: Zap },
    { id: 'repair_house', name: ts("cat_repair_house"), icon: Hammer },
    { id: 'furniture', name: ts("cat_furniture"), icon: Sofa },
    { id: 'renovator', name: ts("cat_renovator"), icon: Activity },
    { id: 'cleaning', name: ts("cat_cleaning") || "Cleaning", icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500">
      <div className="fixed inset-0 z-0">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/5 dark:bg-indigo-600/20 blur-[120px]" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 3, delay: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" 
        />
      </div>

      <div className="relative z-10">
        <section className="relative pt-24 pb-16 px-6">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={itemVariants}>
              <Badge className="mb-6 py-1.5 px-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 backdrop-blur-xl">
                <Sparkles size={14} className="mr-2" />
                {t('badge')}
              </Badge>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-tight mb-6"
            >
              {t('hero_title').split(' ').slice(0, -2).join(' ')} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 dark:from-indigo-400 dark:via-cyan-400 dark:to-blue-500">
                {t('hero_title').split(' ').slice(-2).join(' ')}
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              {t('hero_subtitle')}
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="relative max-w-3xl mx-auto group mb-6"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-2xl blur opacity-20 dark:opacity-30 group-hover:opacity-40 transition duration-1000" />
              <div className="relative flex flex-col md:flex-row gap-3 p-3 bg-white dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  <Input
                    placeholder={t('search_placeholder')}
                    className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="h-14 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-[0_8px_20px_rgb(79,70,229,0.3)] font-bold"
                >
                  {t('find_btn')}
                </Button>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-2 mt-6"
            >
              <span className="text-sm text-slate-500 dark:text-slate-400 mr-2">
                {t('popular_services')}
              </span>
              {popularCategories.map((cat) => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 transition-all"
                >
                  <cat.icon size={14} />
                  {cat.name}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="group overflow-hidden bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 rounded-3xl transition-all hover:-translate-y-1 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 mb-5">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500">
                      <Users size={26} />
                    </div>
                    <h3 className="text-2xl font-bold">{t('hire_title')}</h3>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-base mb-6">
                    {t('hire_desc')}
                  </p>
                  <Link href="/search">
                    <Button variant="outline" className="border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white">
                      {t('hire_btn')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="group overflow-hidden bg-white dark:bg-indigo-600/[0.03] border-slate-100 dark:border-slate-800 rounded-3xl transition-all hover:-translate-y-1 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6 mb-5">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-3xl flex items-center justify-center text-cyan-500">
                      <Wrench size={26} />
                    </div>
                    <h3 className="text-2xl font-bold">{t('worker_title')}</h3>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-base mb-6">
                    {t('worker_desc')}
                  </p>
                  <Link href="/register-worker">
                    <Button className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20">
                      {t('worker_btn')} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ПРИМЕРЫ МАСТЕРОВ */}
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <motion.h2 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-3"
            >
              {t('top_masters_title')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400"
            >
              {t('top_masters_subtitle')}
            </motion.p>
          </div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Card key={idx} className="bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse">
                  <CardContent className="p-5 text-center">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto mb-4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto mb-4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : topWorkers.length > 0 ? (
              topWorkers.map((worker: any) => (
                <motion.div variants={itemVariants} key={worker.id}>
                  <Card className="bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 rounded-2xl hover:shadow-lg transition-all group">
                    <CardContent className="p-5 text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        {worker.user?.avatar ? (
                          <img 
                            src={worker.user.avatar} 
                            alt={worker.user.name} 
                            className="w-full h-full object-cover rounded-2xl shadow-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                            <UserRound size={36} />
                          </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-100 dark:border-slate-700">
                          {worker.category === "electrician" ? <Zap size={14} className="text-amber-500" /> :
                          worker.category === "plumber" ? <Droplets size={14} className="text-blue-500" /> :
                          <Hammer size={14} className="text-indigo-500" />}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold truncate px-2">{worker.user?.name || t('default_name')}</h3>
                      <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium capitalize">
                        {ts(`cat_${worker.category}`) || worker.category || t('default_name')}
                      </p>
                      
                      <div className="flex items-center justify-center gap-1 mt-2 text-amber-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-semibold">
                          {worker.rating?.toFixed(1) || "5.0"}
                        </span>
                        <span className="text-slate-400 text-xs">
                          ({worker.completedOrders || 0} {t('orders_count')})
                        </span>
                      </div>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 line-clamp-2 min-h-[2.5rem]">
                        {worker.about || t('default_about')}
                      </p>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-4 text-indigo-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 transition-colors w-full"
                        onClick={() => router.push(`/worker/${worker.id}`)}
                      >
                        {t('view_more')}
                        <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-500">{t('not_found')}</p>
              </div>
            )}
          </motion.div>
        </section>

        <section className="py-20 px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] bg-indigo-600 p-16 md:p-20 text-white"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <ClipboardList size={400} className="translate-x-1/2 translate-y-1/4 rotate-12" />
            </div>
            
            <div className="relative z-10 max-w-2xl space-y-8">
              <Badge className="bg-white/20 text-white border-none backdrop-blur-md">
                {t('stat_orders')}
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black leading-tight">
                {tJobs('create_title')}
              </h2>
              <p className="text-indigo-100 text-lg md:text-xl font-medium">
                {tJobs('create_subtitle')}
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <Link href="/jobs/create">
                  <Button size="lg" className="h-16 px-10 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">
                    {tJobs('form_submit')}
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="h-16 px-10 border-white/30 text-white hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-xs">
                    {tJobs('title')}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* СТАТИСТИКА */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-6 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-[2rem] bg-white dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 backdrop-blur-sm">
            {[
              { label: t('stat_masters'), value: "850+" },
              { label: t('stat_cities'), value: "14" },
              { label: t('stat_orders'), value: "18k+" },
              { label: t('stat_rating'), value: "4.95/5" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-2xl md:text-3xl font-bold text-indigo-600 dark:text-indigo-400"
                >
                  {stat.value}
                </motion.div>
                <div className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Нижний призыв */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pb-20"
        >
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {t('urgent_repair')}
          </p>
          <Button
            onClick={() => router.push("/search")}
            variant="link"
            className="text-indigo-600 mt-2"
          >
            {t('go_to_search')}
            <PhoneCall size={16} className="ml-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
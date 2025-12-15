import React, { useState, useEffect } from 'react';
import { useChessGame } from './hooks/useChessGame';
import Board from './components/Board';
import CapturedGraveyard from './components/CapturedGraveyard';
import GameTimer from './components/GameTimer';
import ChessPiece from './components/ChessPiece';
import VisualEffects from './components/VisualEffects'; 
import { soundManager } from './services/soundManager';
import { PlayerColor, GameMode, Difficulty, PieceType } from './types';
import { RotateCcw, ShieldAlert, Swords, Trophy, Cpu, Users, Play, LogOut, ChevronLeft, Skull, Ghost, Crown, Music, VolumeX, Check, Globe, Copy, Link, Wifi, WifiOff, Bird, Zap, Flame, Leaf, Waves } from 'lucide-react';

const App: React.FC = () => {
  const { 
    game, 
    gameState, 
    gameStatus, 
    selectedSquare, 
    possibleMoves, 
    isMusicOn, 
    promotionPending,
    roomId,
    isPeerConnected,
    myOnlineColor,
    toggleMusic,
    handleSquareClick, 
    handlePromotionSelection,
    resetGame,
    startGame,
    quitToMenu,
    setGameMode,
    setOpponent,
    setDifficulty,
    setGameStatus,
    hostOnlineGame,
    joinOnlineGame
  } = useChessGame();

  const isWhiteTurn = gameState.turn === PlayerColor.WHITE;
  const isBoardFlipped = gameState.opponent === 'online' && myOnlineColor === PlayerColor.BLACK;

  const [promotionChoice, setPromotionChoice] = useState<PieceType>(PieceType.QUEEN);
  const [isShaking, setIsShaking] = useState(false);
  const [joinIdInput, setJoinIdInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (promotionPending) {
        setPromotionChoice(PieceType.QUEEN);
    }
  }, [promotionPending]);

  useEffect(() => {
    if (gameState.isGameOver && gameState.winner) {
        setIsShaking(true);
        const isWhiteWinner = gameState.winner === PlayerColor.WHITE;
        soundManager.playCheckmateSequence(isWhiteWinner);
        const timer = setTimeout(() => setIsShaking(false), 800);
        return () => clearTimeout(timer);
    } else {
        setIsShaking(false);
    }
  }, [gameState.isGameOver, gameState.winner]);

  const handleMenuClick = (action: () => void) => {
    soundManager.playClick();
    action();
  };

  const handleCopyId = () => {
      navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      soundManager.playSelect();
  };

  const Background = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-slate-950">
        <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
            <source 
                src="https://raw.githubusercontent.com/zhuofan2h/gamecatur/1773d991297fd63294bd75c5855f8859490a38fe/videoakaza.mp4" 
                type="video/mp4" 
            />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/30 to-slate-950/90"></div>
    </div>
  );

  // --- MENU COMPONENTS ---

  const MenuCard = ({ 
    active, 
    onClick, 
    title, 
    icon: Icon, 
    customIcon,
    bgClass = "bg-slate-900", 
    bgImage
  }: any) => (
    <button
      onClick={onClick}
      className={`
        relative group flex flex-col items-center p-0 h-28 md:h-32 w-full
        rounded-lg transition-all duration-300
        ${active 
            ? 'scale-105 z-10 brightness-110 ring-2 ring-[#ffaa00]/50 shadow-[0_0_15px_rgba(255,170,0,0.5)]' 
            : 'opacity-90 hover:opacity-100 hover:-translate-y-1'
        }
        ${!bgImage ? 'bg-black/80 border-[3px] border-[#5c4033] justify-center' : ''}
        overflow-hidden shadow-2xl border-2 border-[#3e2723]
      `}
    >
      {/* Background Image Logic */}
      {bgImage ? (
        <div 
          className="absolute inset-0 z-0"
          style={{
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: '100% 100%', 
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: active ? 'brightness(1.1) contrast(1.1)' : 'brightness(0.7) sepia(0.4)'
          }}
        ></div>
      ) : (
        <div className={`absolute inset-0 opacity-60 ${bgClass}`}></div>
      )}
      
      {/* Selection Glow for Active State */}
      {active && bgImage && <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,170,0,0.4)] z-10 rounded-lg"></div>}
      
      {/* Content */}
      <div className="relative z-20 flex flex-col items-center w-full h-full">
        
        {/* Icon/Image Area */}
        {/* FIXED: Logic changed. If customIcon, use h-full so it sits behind the text gradient without gaps. */}
        <div className={`absolute top-0 left-0 right-0 flex items-center justify-center ${customIcon ? 'h-full z-10' : 'h-[72%] pt-2 z-20'}`}>
             {customIcon ? (
                <img 
                    src={customIcon} 
                    alt={title}
                    className={`w-full h-full object-cover transition-all duration-500
                    ${active 
                        ? 'scale-110 brightness-110' // Selected: Zoom, Bright
                        : 'scale-100 brightness-75' // Not selected: Darker, but FULL COLOR (no grayscale)
                    }`} 
                />
             ) : (
                <Icon 
                    className={`w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]
                    ${bgImage 
                        ? (active ? 'text-[#ffcc80] scale-110 transition-transform' : 'text-[#8d6e63]') 
                        : (active ? 'text-yellow-400' : 'text-slate-200')
                    }`} 
                />
             )}
        </div>

        {/* Title Area - Gradient Solidified to cover bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 h-[28%] flex items-center justify-center pb-1 bg-gradient-to-t from-black via-black/90 to-transparent z-20"> 
            <span 
                className={`cinzel font-black text-[10px] md:text-[11px] uppercase tracking-[0.15em] leading-none text-center px-1
                ${bgImage 
                    ? (active ? 'text-[#ffecb3] drop-shadow-[0_1px_3px_rgba(0,0,0,1)]' : 'text-[#bcaaa4]') 
                    : (active ? 'text-yellow-100' : 'text-slate-300')
                } 
                transition-colors duration-300`}
            >
                {title}
            </span>
        </div>
      </div>

      {/* Inner Frame Border - Overlay everything (z-30) to hide edges */}
      <div className="absolute inset-0 border-4 border-[#2d1b15]/50 rounded-lg pointer-events-none z-30"></div>
    </button>
  );

  // REVERTED: Time Control Card using Image Background
  const TimeControlCard = ({ active, onClick, title, time, icon: Icon, colorClass }: any) => (
    <button
        onClick={onClick}
        className={`
            relative group flex flex-col items-center p-0 h-32 md:h-36 w-full
            rounded-xl transition-all duration-300 overflow-hidden shadow-xl
            ${active ? 'scale-105 z-10 brightness-110 ring-2 ring-[#ffaa00]' : 'opacity-90 hover:opacity-100 hover:-translate-y-1'}
        `}
    >
        {/* Background Image - Stretched to fit (100% 100%) */}
        <div 
            className="absolute inset-0 z-0"
            style={{
                backgroundImage: `url('https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/menutimecontrol.jpg')`,
                backgroundSize: '100% 100%', 
                backgroundPosition: 'center',
                filter: active ? 'sepia(0.2) contrast(1.1)' : 'sepia(0.5) brightness(0.8)'
            }}
        ></div>

        {/* Active Glow Overlay */}
        {active && <div className="absolute inset-0 bg-yellow-500/10 z-0 animate-pulse"></div>}

        {/* Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col">
            
            {/* Top Area (Icon) - Adjusted height to 68% to push footer area up */}
            <div className="flex-1 flex items-center justify-center pt-2 h-[68%]">
                 <Icon className={`w-10 h-10 md:w-12 md:h-12 drop-shadow-md ${active ? colorClass : 'text-[#3e2723] opacity-60'}`} />
            </div>

            {/* Bottom Footer (Title & Time) - Expanded to 32% and added pb-3 to lift text */}
            <div className="w-full h-[32%] flex flex-col items-center justify-center pb-3 space-y-0.5">
                <span className={`cinzel font-black text-[10px] md:text-xs tracking-widest uppercase leading-none
                    ${active ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-[#d7ccc8] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'}`}>
                    {title}
                </span>
                <span className={`font-mono text-[9px] md:text-[10px] font-bold leading-none
                    ${active ? 'text-yellow-400' : 'text-[#a1887f]'}`}>
                    {time}
                </span>
            </div>
        </div>
    </button>
  );

  const ScrollBanner = ({ text }: { text: string }) => (
    <div className="relative w-full flex items-center justify-center my-4 py-3">
        {/* Paper Body */}
        <div className="absolute inset-0 bg-[#f7e7ce] clip-scroll shadow-[0_0_15px_rgba(0,0,0,0.5)] border-y-2 border-[#5c4033]"></div>
        {/* Paper Texture */}
        <div className="absolute inset-0 bg-[#f7e7ce] opacity-50 clip-scroll bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]"></div>
        
        {/* Roll Ends */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 md:w-6 h-8 md:h-10 bg-[#3e2723] rounded-sm border-r-2 border-[#1a100e] shadow-lg flex flex-col justify-center gap-1 px-1">
            <div className="w-full h-[1px] bg-[#5d4037]"></div>
            <div className="w-full h-[1px] bg-[#5d4037]"></div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 md:w-6 h-8 md:h-10 bg-[#3e2723] rounded-sm border-l-2 border-[#1a100e] shadow-lg flex flex-col justify-center gap-1 px-1">
            <div className="w-full h-[1px] bg-[#5d4037]"></div>
            <div className="w-full h-[1px] bg-[#5d4037]"></div>
        </div>

        {/* Text */}
        <h3 className="relative z-10 cinzel font-black text-[#3e2723] text-lg md:text-xl tracking-[0.2em] drop-shadow-sm uppercase">
            {text}
        </h3>
    </div>
  );

  // --- LOBBY SCREEN (Update visual to match reference) ---
  if (gameStatus === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
          <Background />
          
          {/* Main Glass Container */}
          <div className="z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative animate-fade-in-up">
              
              {/* Back Button */}
              <button onClick={() => handleMenuClick(quitToMenu)} className="absolute top-6 left-6 flex items-center gap-2 text-slate-300 hover:text-white uppercase text-[10px] font-bold tracking-[0.2em] transition-colors z-20">
                  <ChevronLeft className="w-4 h-4" /> BACK
              </button>

              {/* Title Scroll */}
              <div className="mt-8 mb-6">
                 <ScrollBanner text="ONLINE PORTAL" />
              </div>
              
              <div className="space-y-6">
                
                {/* --- HOST GAME SECTION --- */}
                <div className="relative group">
                    <h3 className="text-[#deb887] font-cinzel font-bold text-sm mb-2 flex items-center gap-2 tracking-wider drop-shadow-md">
                         <Crown className="w-4 h-4 text-yellow-500" /> HOST GAME
                    </h3>
                    
                    {!roomId ? (
                        <button 
                            onClick={() => { handleMenuClick(() => { setOpponent('online'); hostOnlineGame(); }); }} 
                            className="relative w-full h-14 bg-gradient-to-r from-[#8B0000] to-[#FF4500] rounded-lg border border-red-400/50 shadow-[0_0_20px_rgba(220,38,38,0.4)] overflow-hidden flex items-center justify-center group-hover:scale-[1.02] active:scale-95 transition-all duration-300"
                        >
                            {/* Decorative Fire */}
                            <div className="absolute right-[-15px] bottom-[-15px] opacity-80 pointer-events-none mix-blend-screen">
                                <Flame className="w-16 h-16 text-yellow-300 animate-pulse" />
                            </div>
                            <span className="relative z-10 cinzel font-black text-white tracking-[0.15em] text-lg drop-shadow-md">
                                GENERATE CODE
                            </span>
                        </button>
                    ) : (
                        <div className="flex justify-between items-center bg-black/60 p-4 rounded-lg border border-slate-600 shadow-inner">
                            <code className="text-green-400 text-2xl font-mono tracking-[0.2em] font-bold">{roomId}</code>
                            <button onClick={handleCopyId} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <Copy className="w-5 h-5 text-slate-400 hover:text-white" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Separator */}
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"></div>
                
                {/* --- JOIN GAME SECTION --- */}
                <div className="relative group">
                    <h3 className="text-[#a5b4fc] font-cinzel font-bold text-sm mb-2 flex items-center gap-2 tracking-wider drop-shadow-md">
                         <Swords className="w-4 h-4 text-indigo-400" /> JOIN GAME
                    </h3>
                    
                    <div className="relative w-full h-14 flex items-center">
                        {/* Scroll Input Background */}
                        <div className="relative w-full h-full rounded-lg shadow-inner overflow-hidden flex items-center pr-24 border-2 border-[#5d4037] bg-[#f3e5ab]">
                             <input 
                                type="text" 
                                placeholder="CODE" 
                                value={joinIdInput} 
                                onChange={(e) => setJoinIdInput(e.target.value)} 
                                className="w-full h-full bg-transparent border-none outline-none px-4 text-[#3e2723] font-cinzel font-bold placeholder-[#8d6e63]/60 text-lg uppercase tracking-widest z-10"
                             />
                        </div>

                        {/* Water/Wave Button (Overlapping) */}
                        <button 
                            onClick={() => { if(joinIdInput) { handleMenuClick(() => { setOpponent('online'); joinOnlineGame(joinIdInput.toUpperCase()); }); }}} 
                            className="absolute right-0 top-1/2 -translate-y-1/2 h-[120%] w-24 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl border-2 border-cyan-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all z-20 overflow-hidden"
                            style={{ 
                                clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 15% 100%, 0% 50%)', // Arrow/Banner shape
                            }}
                        >
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                             <span className="relative cinzel font-black text-white tracking-widest text-sm drop-shadow-md leading-none ml-2">JOIN</span>
                             <Waves className="relative w-4 h-4 text-cyan-200 mt-1 ml-2 animate-pulse" />
                        </button>
                    </div>
                </div>

              </div>
          </div>
      </div>
    );
  }

  // --- MENU SCREEN ---
  if (gameStatus === 'menu') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center py-6 px-4 relative overflow-hidden font-sans">
         <Background />
        
        <button 
            onClick={() => handleMenuClick(toggleMusic)}
            className={`absolute top-4 right-4 p-3 rounded-full z-50 transition-all ${isMusicOn ? 'bg-yellow-600 text-black' : 'bg-black/50 text-slate-400'}`}
        >
            {isMusicOn ? <Music className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        <div className="z-10 w-full max-w-2xl animate-fade-in-up flex flex-col items-center">
            
            {/* LOGO */}
            <div className="relative mb-4 flex flex-col items-center">
                <img 
                    src="https://raw.githubusercontent.com/zhuofan2h/gamecatur/85809bd3e0b3cb78d356c88d937b7abd4ab05700/gambar/logodemonslayer.png" 
                    alt="Demon Slayer Logo"
                    className="w-64 md:w-80 object-contain drop-shadow-[0_5px_15px_rgba(0,0,0,1)] hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* === INFINITY CASTLE FRAME (BUATAN CSS) === */}
            <div className="relative w-full bg-transparent border-[3px] border-[#3e2723] rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                
                {/* 1. REMOVED TEXTURE/BACKGROUND (To make center empty) */}
                
                {/* 2. Metallic Inner Border (Rust Effect) - Slight opacity boost to see frame */}
                <div className="absolute inset-1 border border-[#8d6e63] opacity-60 rounded-sm pointer-events-none"></div>
                
                {/* 3. Corner Accents (The "Brackets") */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#5d4037] z-20"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#5d4037] z-20"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#5d4037] z-20"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#5d4037] z-20"></div>

                {/* 4. CONTENT CONTAINER */}
                <div className="relative z-10 p-4 md:p-6 flex flex-col gap-3">
                    
                    {/* --- SELECT OPPONENT HEADER --- */}
                    <div className="flex items-center justify-center -mt-1">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8d6e63] to-transparent opacity-50"></div>
                        <h3 className="cinzel font-black text-[#d7ccc8] text-sm md:text-base tracking-[0.2em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)] px-4">
                            SELECT YOUR OPPONENT
                        </h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#8d6e63] to-transparent opacity-50"></div>
                    </div>

                    {/* --- GRID: OPPONENT --- */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4">
                        <MenuCard 
                            title="VS AI" 
                            icon={Bird} 
                            customIcon={gameState.opponent === 'ai' 
                                ? "https://raw.githubusercontent.com/zhuofan2h/gamecatur/6b7b2679eb5decdcc2fa3de1a6e907b26937c40e/gambar/vsaitanjiro.gif" 
                                : "https://raw.githubusercontent.com/zhuofan2h/gamecatur/bda698bfb687016fde71f19b7fa3ceb5d3295835/gambar/vsaitanjiro.jpeg"
                            }
                            active={gameState.opponent === 'ai'} 
                            onClick={() => handleMenuClick(() => setOpponent('ai'))}
                            bgImage="https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/menu.jpg"
                        />
                        <MenuCard 
                            title="LOCAL" 
                            icon={Users} 
                            customIcon={gameState.opponent === 'human'
                                ? "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/localinosuke.gif"
                                : "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/localinosuke.jpeg"
                            }
                            active={gameState.opponent === 'human'} 
                            onClick={() => handleMenuClick(() => setOpponent('human'))}
                            bgImage="https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/menu.jpg"
                        />
                        <MenuCard 
                            title="ONLINE" 
                            icon={Globe} 
                            customIcon={gameState.opponent === 'online'
                                ? "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/onlinezenitsu.gif"
                                : "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/onlinezenitsu.jpeg"
                            }
                            active={gameState.opponent === 'online'} 
                            onClick={() => handleMenuClick(() => setGameStatus('lobby'))}
                            bgImage="https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/menu.jpg"
                        />
                    </div>

                    {/* --- GRID: DIFFICULTY (Only shown if AI, else placehold or hide) --- */}
                    {gameState.opponent === 'ai' && (
                        <div className="grid grid-cols-3 gap-3 md:gap-4 animate-fade-in">
                            <MenuCard 
                                title="Lower Moon" 
                                icon={Ghost} 
                                customIcon={gameState.difficulty === 'easy'
                                    ? "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/gambar/lowermoonrui.gif"
                                    : "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/gambar/lowermoonrui.jpeg"
                                }
                                active={gameState.difficulty === 'easy'} 
                                onClick={() => handleMenuClick(() => setDifficulty('easy'))}
                                bgImage="https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/menu.jpg"
                            />
                            <MenuCard 
                                title="Upper Moon" 
                                icon={Swords} 
                                customIcon={gameState.difficulty === 'medium'
                                    ? "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/gambar/uppermoonakaza.gif"
                                    : "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/gambar/uppermoonakaza.jpeg"
                                }
                                active={gameState.difficulty === 'medium'} 
                                onClick={() => handleMenuClick(() => setDifficulty('medium'))}
                                bgImage="https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/menu.jpg"
                            />
                            <MenuCard 
                                title="Muzan" 
                                icon={Skull} 
                                customIcon={gameState.difficulty === 'hard'
                                    ? "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/gambar/Muzan.gif"
                                    : "https://raw.githubusercontent.com/zhuofan2h/gamecatur/81194cd301d154b76072169d70a4d22921337778/gambar/Muzan.jpeg"
                                }
                                active={gameState.difficulty === 'hard'} 
                                onClick={() => handleMenuClick(() => setDifficulty('hard'))}
                                bgImage="https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/menu.jpg"
                            />
                        </div>
                    )}

                    {/* --- TIME CONTROL SECTION (REVERTED TO IMAGE STYLE) --- */}
                    <div className="mt-0">
                        {/* Banner Image */}
                        <div className="relative w-full flex items-center justify-center mb-3">
                            <img 
                                src="https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/timecontrol.png" 
                                alt="Time Control Scroll" 
                                className="w-full max-w-sm h-auto object-contain drop-shadow-md"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pt-1 md:pt-2">
                                <h3 className="cinzel font-black text-[#3e2723] text-sm md:text-lg tracking-[0.2em] drop-shadow-sm uppercase">
                                    TIME CONTROL
                                </h3>
                            </div>
                        </div>

                        {/* Time Control Cards (Reverted to menutimecontrol.jpg) */}
                        <div className="grid grid-cols-4 gap-2 md:gap-3">
                            <TimeControlCard 
                                active={gameState.mode === 'untimed'}
                                onClick={() => handleMenuClick(() => setGameMode('untimed'))}
                                title="ZEN"
                                time="∞"
                                icon={Leaf}
                                colorClass="text-green-500"
                            />
                            <TimeControlCard 
                                active={gameState.mode === 'rapid'}
                                onClick={() => handleMenuClick(() => setGameMode('rapid'))}
                                title="RAPID"
                                time="10m"
                                icon={Zap}
                                colorClass="text-yellow-400"
                            />
                            <TimeControlCard 
                                active={gameState.mode === 'blitz'}
                                onClick={() => handleMenuClick(() => setGameMode('blitz'))}
                                title="BLITZ"
                                time="5m"
                                icon={Swords}
                                colorClass="text-blue-400"
                            />
                            <TimeControlCard 
                                active={gameState.mode === 'bullet'}
                                onClick={() => handleMenuClick(() => setGameMode('bullet'))}
                                title="BULLET"
                                time="1m"
                                icon={Flame}
                                colorClass="text-red-500"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* 4. ENTER BATTLE BUTTON - Outside Frame */}
            <div className="mt-2 w-full max-w-2xl px-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <button 
                    onClick={startGame}
                    className="group relative w-full h-20 md:h-24 flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 bg-transparent border-none outline-none focus:outline-none"
                >
                    {/* Fire Aura Effect REMOVED to remove 'border' look on hover */}
                    {/* <div className="absolute inset-2 bg-orange-600 blur-2xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 rounded-full z-0"></div> */}

                    {/* Image Background - REMOVED shadow-2xl */}
                    <div 
                        className="absolute inset-0 z-10 rounded-xl overflow-hidden"
                        style={{
                            backgroundImage: `url('https://raw.githubusercontent.com/zhuofan2h/gamecatur/08bb2d2a5e6785014535751939921c651536e5e5/gambar/enterbattle.jpg')`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    >
                         {/* Removed gradient overlay to prevent bottom darkness */}
                    </div>

                    {/* Hover Overlay Tint REMOVED to keep it clean */}
                    {/* <div className="absolute inset-0 bg-black/0 group-hover:bg-yellow-500/10 transition-colors z-20 rounded-xl"></div> */}

                    {/* Text Content - Added pt-3 to move text down */}
                    <div className="relative z-30 flex items-center justify-center gap-3 pt-3">
                         <Swords className="w-6 h-6 text-[#ffab40] animate-pulse" />
                         <span className="cinzel font-black text-2xl text-[#ffecb3] tracking-[0.2em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            ENTER BATTLE
                         </span>
                         <Swords className="w-6 h-6 text-[#ffab40] animate-pulse flip-x" style={{ transform: 'scaleX(-1)' }} />
                    </div>
                </button>
            </div>
            
        </div>
      </div>
    );
  }

  // --- GAME SCREEN (Unchanged layout mostly, just ensuring background persists) ---
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-4 px-2 md:py-8 overflow-hidden relative">
      <Background />

      <VisualEffects 
        isActive={gameState.isGameOver} 
        winner={gameState.winner} 
        method={gameState.isTimeout ? 'timeout' : 'checkmate'}
        onRematch={() => handleMenuClick(resetGame)}
        onMenu={() => handleMenuClick(quitToMenu)}
      />

      {/* Header Compact */}
      <header className="z-10 w-full max-w-[1600px] flex items-center justify-between mb-4 px-4 md:px-0 relative">
        <button 
            onClick={quitToMenu}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest group"
        >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            {gameState.opponent === 'online' ? 'DISCONNECT' : 'MENU'}
        </button>
        <div className="text-center hidden md:block">
            <h1 className="cinzel font-bold text-slate-500 tracking-widest text-sm">DEMON SLAYER CHESS</h1>
        </div>
        
        <div className="flex items-center gap-4">
             {/* ONLINE STATUS INDICATOR */}
             {gameState.opponent === 'online' && (
                 <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isPeerConnected ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500 animate-pulse'}`}>
                     {isPeerConnected ? <Wifi className="w-3 h-3 text-green-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                     <span className={`text-[10px] font-bold tracking-wider ${isPeerConnected ? 'text-green-400' : 'text-red-400'}`}>
                         {isPeerConnected ? 'LINKED' : 'WAITING'}
                     </span>
                 </div>
             )}

            <button 
                onClick={() => handleMenuClick(toggleMusic)}
                className={`p-2 rounded-full transition-all duration-300 ${isMusicOn ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
                 {isMusicOn ? <Music className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
        </div>
      </header>

      {/* PROMOTION MODAL */}
      {promotionPending && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a1a] border-4 border-[#5c2e2e] p-8 rounded-sm shadow-[0_0_60px_rgba(185,28,28,0.4)] max-w-lg w-full text-center relative overflow-hidden ring-4 ring-black/50">
                <div className="absolute inset-0 opacity-10 pointer-events-none" 
                     style={{ backgroundImage: 'linear-gradient(#3f1d1d 1px, transparent 1px), linear-gradient(90deg, #3f1d1d 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                </div>

                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                
                <h3 className="relative z-10 cinzel text-3xl font-black text-red-500 mb-2 tracking-[0.2em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    EVOLUTION
                </h3>
                <p className="relative z-10 text-[#a3a3a3] text-xs font-serif uppercase tracking-widest mb-8">
                    Awaken True Power
                </p>

                <div className="relative z-10 flex justify-center gap-6 mb-8">
                    {[PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].map((type) => {
                         const isSelected = promotionChoice === type;
                         return (
                            <button
                                key={type}
                                onClick={() => handleMenuClick(() => setPromotionChoice(type))}
                                className={`flex flex-col items-center gap-3 group transition-all duration-300 ${isSelected ? '-translate-y-2' : ''}`}
                            >
                                <div className={`w-20 h-20 rounded-lg flex items-center justify-center transition-all duration-300 relative overflow-hidden
                                    ${isSelected 
                                        ? 'bg-[#3a1a1a] border-2 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.8)]' 
                                        : 'bg-[#2a2a2a] border-2 border-[#4a4a4a] hover:border-red-500/50 hover:bg-[#322020]'
                                    }`}
                                >
                                     {isSelected && <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>}
                                     <div className={`transition-transform duration-300 relative z-10 ${isSelected ? 'scale-150' : 'scale-100 group-hover:scale-125'}`}>
                                        <ChessPiece type={type} color={promotionPending.color} />
                                     </div>
                                </div>
                                <span className={`text-xs uppercase font-bold tracking-widest transition-colors font-cinzel 
                                    ${isSelected ? 'text-red-400' : 'text-[#888] group-hover:text-red-400/70'}`}>
                                    {type === PieceType.QUEEN && 'QUEEN'}
                                    {type === PieceType.ROOK && 'ROOK'}
                                    {type === PieceType.BISHOP && 'BISHOP'}
                                    {type === PieceType.KNIGHT && 'KNIGHT'}
                                </span>
                            </button>
                         );
                    })}
                </div>

                <div className="relative z-10">
                    <button 
                        onClick={() => handleMenuClick(() => handlePromotionSelection(promotionChoice))}
                        className="w-full bg-red-700 hover:bg-red-600 text-white font-cinzel font-black py-4 px-6 rounded border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_25px_rgba(220,38,38,0.8)] transition-all duration-200 flex items-center justify-center gap-2 tracking-[0.2em] group"
                    >
                         <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         CONFIRM
                    </button>
                </div>

            </div>
         </div>
      )}

      {/* Main Layout - Vertical Stack */}
      <div className="z-10 w-full max-w-[850px] flex flex-col gap-4 items-center justify-center">
        
        {/* 1. TOP PANEL: Twelve Kizuki (Black) */}
        <div className="w-full">
             <div className={`p-3 md:p-4 rounded-xl border-r-4 transition-all duration-500 bg-slate-900/80 backdrop-blur-md ${!isWhiteTurn ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-slate-700 opacity-90'}`}>
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
                       <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-200 leading-none">Twelve Kizuki</h3>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {gameState.opponent === 'ai' 
                                    ? `AI: ${gameState.difficulty === 'easy' ? 'Lower Moon' : gameState.difficulty === 'medium' ? 'Upper Moon' : 'Muzan'}`
                                    : (gameState.opponent === 'online' && myOnlineColor === PlayerColor.WHITE) ? 'Online Guest'
                                    : (gameState.opponent === 'online' && myOnlineColor === PlayerColor.BLACK) ? 'You (Demon)'
                                    : 'Player 2'}
                            </span>
                       </div>
                   </div>
                   <GameTimer 
                        timeInSeconds={gameState.blackTime} 
                        isActive={!isWhiteTurn && !gameState.isGameOver} 
                        isLowTime={gameState.blackTime < 30}
                        label="TIME"
                   />
                </div>
                <CapturedGraveyard 
                    pieces={gameState.capturedBlack} 
                    playerColor={PlayerColor.BLACK} 
                    label="Demons Slain"
                />
            </div>
        </div>

        {/* 2. CENTER: Board Area */}
        <div className={`flex flex-col items-center gap-2 w-full transition-transform ${isShaking ? 'animate-shake-hard' : ''}`}>
            
             <div className="bg-slate-900/80 backdrop-blur px-6 py-2 rounded-full border border-slate-700 flex items-center gap-4 w-full md:w-auto justify-center h-10 mb-2">
                {gameState.isGameOver ? (
                    <div className="flex items-center gap-2 text-yellow-400 font-black animate-pulse text-sm">
                        <Trophy className="w-4 h-4" />
                        {gameState.isTimeout ? "TIME OUT - " : ""}
                        {gameState.isDraw ? "DRAW" : (gameState.winner === PlayerColor.WHITE ? "SLAYERS WIN" : "DEMONS WIN")}
                    </div>
                ) : gameState.isCheck ? (
                     <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                        <ShieldAlert className="w-4 h-4" /> CHECK
                     </div>
                ) : (
                    <div className="flex items-center gap-2 text-slate-400 font-cinzel text-xs md:text-sm">
                        <Swords className="w-4 h-4" /> 
                        {gameState.opponent === 'online' ? 'PVP MATCH' : `${gameState.mode.toUpperCase()} MATCH`}
                    </div>
                )}
            </div>

            <Board 
                game={game}
                selectedSquare={selectedSquare}
                possibleMoves={possibleMoves}
                onSquareClick={handleSquareClick}
                turn={gameState.turn}
                inCheck={gameState.isCheck}
                losingKingSquare={gameState.losingKingSquare}
                isFlipped={isBoardFlipped} // Pass flip state
            />
            
            {/* Online Turn Indicator (Optional helper text) */}
            {gameState.opponent === 'online' && myOnlineColor && (
                 <div className="text-xs text-slate-500 font-mono">
                     YOU ARE: <span className={myOnlineColor === PlayerColor.WHITE ? "text-indigo-400" : "text-red-500"}>
                         {myOnlineColor === PlayerColor.WHITE ? 'WHITE (SLAYER)' : 'BLACK (DEMON)'}
                     </span>
                 </div>
            )}
        </div>

        {/* 3. BOTTOM PANEL: Demon Slayer Corps (White) */}
        <div className="w-full">
            <div className={`p-3 md:p-4 rounded-xl border-l-4 transition-all duration-500 bg-slate-900/80 backdrop-blur-md ${isWhiteTurn ? 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'border-slate-700 opacity-90'}`}>
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-200 leading-none">Demon Slayer Corps</h3>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                                {gameState.opponent === 'human' ? 'Player 1' 
                                 : gameState.opponent === 'ai' ? 'You'
                                 : (gameState.opponent === 'online' && myOnlineColor === PlayerColor.WHITE) ? 'You (Slayer)'
                                 : 'Online Host'}
                            </span>
                        </div>
                   </div>
                   <GameTimer 
                        timeInSeconds={gameState.whiteTime} 
                        isActive={isWhiteTurn && !gameState.isGameOver} 
                        isLowTime={gameState.whiteTime < 30}
                        label="TIME"
                   />
                </div>
                <CapturedGraveyard 
                    pieces={gameState.capturedWhite} 
                    playerColor={PlayerColor.WHITE} 
                    label="Corps Safe"
                />
            </div>
        </div>

        {/* 4. FOOTER: Action Buttons (Disabled in Online to avoid desync for now, except Surrender) */}
        <div className="flex gap-2 w-full mt-2">
            {gameState.opponent !== 'online' && (
                <button 
                    onClick={() => handleMenuClick(resetGame)}
                    className="flex-1 group relative px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all duration-300 rounded overflow-hidden border border-slate-600"
                >
                    <div className="flex items-center justify-center gap-2 relative z-10 font-cinzel font-bold text-sm tracking-widest">
                        <RotateCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
                        RESTART
                    </div>
                </button>
            )}
            <button 
                onClick={quitToMenu}
                className="flex-1 group relative px-8 py-3 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 transition-all duration-300 rounded overflow-hidden border border-slate-600 hover:border-red-800"
            >
                <div className="flex items-center justify-center gap-2 relative z-10 font-cinzel font-bold text-sm tracking-widest">
                    <LogOut className="w-4 h-4" />
                    {gameState.opponent === 'online' ? 'DISCONNECT' : 'SURRENDER'}
                </div>
            </button>
        </div>

      </div>
    </div>
  );
};

export default App;
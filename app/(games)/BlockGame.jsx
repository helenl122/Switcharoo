import gif from '@/assets/block_game/fireworks.gif';
import Block from '@/components/game_components/BlockGame/Block';
import GameHeader from '@/components/GameHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';

export default function BlockGame() {
    // block colors
    const blueFill = "#00E0FF";
    const blueStroke = "#79A1DE";
    const greenFill = "#00FF85";
    const greenStroke = "#56C48F";
    // game variables
    const {width, height} = useWindowDimensions();
    const numBlocks = 7;
    const blockSize = height/numBlocks;
    const animationRef = useRef(null);

    const [currBlock, setCurrBlock] = useState({dir: 1, x:0, y:0, size: blockSize});
    const [stack, setStack] = useState([]);
    const [level, setLevel] = useState(0);
    const [isPanning, setIsPanning] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [showGif, setShowGif] = useState(false);

    // game loop: rerender screen to create animation effect
    useEffect(() => {
        if (!gameOver) {
            // block is either panning or falling
            isPanning ? animationRef.current = 
                requestAnimationFrame(panBlock) : requestAnimationFrame(fallBlock)
        }
    }, [currBlock]);

    // Calls game reset when opening game
    useFocusEffect(
        useCallback(() => {reset();}, [])
    );
    // Reset game blocks
    function reset() {
        setCurrBlock({dir: 1, x:0, y:0, size: blockSize,
            fillColor: blueFill, strokeColor: blueStroke});
        setStack([]);
        setLevel(0);
        setGameOver(false);
        setShowGif(false);
    }

    // controls left/right movement of moving block w/n screen width
    function panBlock() {
        setCurrBlock( prev=> {
            let newX = prev.x + prev.dir*2;
            let newDir = newX > width-blockSize || newX < 0 ? prev.dir * -1 : prev.dir;
            return {...prev, x:newX, dir: newDir};
        })
    }

    // stop current block; if lands on another block, stack otherwise fall
    function stopBlock() {
        // check if empty: not at level 0
        if (stack.length > 0) {
            let lastBlock = stack[stack.length-1];
            let overlap = blockSize - Math.abs(currBlock.x - lastBlock.x);
            (overlap/blockSize >= 0.5) ? stackBlock() : setIsPanning(false);
        // start at level 0: increment level, stack block
        } else {stackBlock();}
    }

    // motion for block falling vertically once stopped
    function fallBlock() {
        setCurrBlock( prev=> {
            let newX = prev.x
            let newY = prev.y-8 // speed
            if (newY <= -blockSize) {
                // reset X & Y once fallen
                newY = level*blockSize;
                newX = 0;
                setIsPanning(true);
            }
            return {...prev, x:newX, y:newY};
        })
    }

    // stacks block: freeze in position & change color
    function stackBlock() {
        setLevel(prev => {
            const nextLevel = prev + 1;
            // check for gameOver
            let hide = 0;
            if (nextLevel > numBlocks-2) {
                setGameOver(true);
                setShowGif(true);
                hide = blockSize;
            }
            setCurrBlock(prevBlock => ({
                ...prevBlock,
                x: prevBlock.dir*-1 + hide,
                y: nextLevel * blockSize + hide
            }));
            return nextLevel;
        });
        setStack([...stack, {...currBlock, fillColor:greenFill, strokeColor:greenStroke}]);
    }

    // block game screen rendering
    return (
        <View className="flex-1">
            <GameHeader/>
            {/* touchable expanded to whole space; can press anywhere on screen */}
            <TouchableWithoutFeedback className="absolute left-0 top-0 right-0 bottom-0" onPress={stopBlock}>
                <View className="flex-1">           
                    {/* render stacked blocks*/}
                    {stack.map((block, index) => (
                        <Block key={index} {...block}/>
                    ))}
                    {/* moving block; to be stacked */}
                    <Block {...currBlock}/>
                    {/* celebration gifs: hidden until game over */}
                    {showGif && <Image className="absolute top-0 left-0" source={gif}/>}
                    {showGif && <Image className="absolute bottom-0 right-0" source={gif}/>}
                </View>
            </TouchableWithoutFeedback>
        </View>
        
    );
};

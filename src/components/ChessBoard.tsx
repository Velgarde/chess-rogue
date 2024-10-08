import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useChess } from '../context/ChessContext';
import { Position, PieceType, Player } from '../utils/types';
import { getRandomPromotionPiece } from '../utils/chessLogic';

const breatheAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const captureAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.5; }
  100% { transform: scale(0); opacity: 0; }
`;


const CapturedPiece = styled.div<{ player: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  color: ${({ player }) => (player === 'white' ? '#ffffff' : '#000000')};
  animation: ${captureAnimation} 0.5s forwards;
  z-index: 10;
`;

const CheckIndicator = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid red;
  box-shadow: 0 0 10px red;
  animation: ${breatheAnimation} 1s infinite ease-in-out;
  z-index: 5;
`;

const CheckmateIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  padding: 20px;
  background-color: rgba(255, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  color: rgba(255, 0, 0, 0.8);
  z-index: 15;
  border-radius: 10px;
`;

const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 1rem auto;
  padding: 0.5rem;

  @media (max-width: 768px) {
    max-width: 95vw;
    padding: 0.25rem;
  }
`;

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px solid #61dafb;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 0 30px rgba(97, 218, 251, 0.5);
  }

  @media (max-width: 480px) {
    border-width: 1px;
  }
`;

interface SquareProps {
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isCheck: boolean;
}

const Square = styled.div<SquareProps>`
  aspect-ratio: 1;
  background-color: ${(props) =>
    props.isSelected ? '#4a90e2' :
    props.isValidMove ? '#45a049' :
    props.isLight ? '#f0d9b5' : '#b58863'};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  outline: none;
  user-select: none;

  &:hover {
    transform: scale(1.05);
    z-index: 10;
    box-shadow: 0 0 15px rgba(97, 218, 251, 0.5);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }

  ${(props) => props.isValidMove && css`
    &::before {
      content: '';
      display: block;
      width: 25%;
      height: 25%;
      border-radius: 50%;
      background-color: rgba(97, 218, 251, 0.5);
      position: absolute;
    }
  `}

  ${(props) => props.isCheck && css`
    animation: ${breatheAnimation} 1s infinite ease-in-out;
  `}
`;

const Piece = styled.div<{ player: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  color: ${({ player }) => (player === 'white' ? '#ffffff' : '#000000')};
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const ChessBoard: React.FC = () => {
  const { board, currentPlayer, movePiece, handlePromotion, getValidMovesForPiece, isInCheck, isGameOver, winner, roles } = useChess();
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [capturedPiece, setCapturedPiece] = useState<{ type: PieceType, player: Player, position: Position } | null>(null);
  useEffect(() => {
    if (selectedPiece) {
      setValidMoves(getValidMovesForPiece(selectedPiece));
    } else {
      setValidMoves([]);
    }
  }, [selectedPiece, getValidMovesForPiece]);

  const handleSquareClick = (row: number, col: number) => {
    const clickedPiece = board[row][col];
    if (selectedPiece) {
      if (isValidMove(row, col)) {
        const targetPiece = board[row][col];
        if (targetPiece) {
          setCapturedPiece({ type: targetPiece.type, player: targetPiece.player, position: { row, col } });
          setTimeout(() => setCapturedPiece(null), 500);
        }
        const movedPiece = board[selectedPiece.row][selectedPiece.col];
        if (movedPiece) {
          const isPromotion = roles[movedPiece.type] === 'pawn' && (row === 0 || row === 7);
movePiece(selectedPiece, { row, col });
if (isPromotion) {
  const promotionPiece = getRandomPromotionPiece();
  handlePromotion({ row, col }, promotionPiece);
}
        }
        setSelectedPiece(null);
      } else if (clickedPiece && clickedPiece.player === currentPlayer) {
        setSelectedPiece({ row, col });
      } else {
        setSelectedPiece(null);
      }
    } else if (clickedPiece && clickedPiece.player === currentPlayer) {
      setSelectedPiece({ row, col });
    }
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isKingInCheck = (row: number, col: number): boolean => {
    const piece = board[row][col];
    return !!(piece && piece.type === 'king' && piece.player === currentPlayer && isInCheck);
  };

  return (
      <BoardContainer>
        <Board>
          {board.map((row, rowIndex) =>
              row.map((piece, colIndex) => (
                  <Square
                      key={`${rowIndex}-${colIndex}`}
                      isLight={(rowIndex + colIndex) % 2 === 0}
                      isSelected={selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex}
                      isValidMove={isValidMove(rowIndex, colIndex)}
                      isCheck={isKingInCheck(rowIndex, colIndex)}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                  >
                    {piece && (
                        <Piece player={piece.player}>
                          {getPieceSymbol(roles[piece.type], piece.player)}
                        </Piece>
                    )}
                    {isKingInCheck(rowIndex, colIndex) && <CheckIndicator />}
                    {capturedPiece && capturedPiece.position.row === rowIndex && capturedPiece.position.col === colIndex && (
                        <CapturedPiece player={capturedPiece.player}>
                          {getPieceSymbol(roles[capturedPiece.type], capturedPiece.player)}
                        </CapturedPiece>
                    )}
                  </Square>
              ))
          )}
        </Board>
        {isGameOver && (
            <CheckmateIndicator>
              {winner ? `Checkmate - ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!` : 'Stalemate - Draw!'}
            </CheckmateIndicator>
        )}
      </BoardContainer>
  );
};

const getPieceSymbol = (role: PieceType, player: 'white' | 'black') => {
  const symbols: { [key: string]: { white: string; black: string } } = {
    pawn: { white: '♙', black: '♟︎' },
    rook: { white: '♖', black: '♜' },
    knight: { white: '♘', black: '♞' },
    bishop: { white: '♗', black: '♝' },
    queen: { white: '♕', black: '♛' },
    king: { white: '♔', black: '♚' },
  };
  return symbols[role][player];
};

export default ChessBoard;
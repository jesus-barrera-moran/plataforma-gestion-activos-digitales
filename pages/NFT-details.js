import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { Table } from "antd";
import { NFTMarketplaceAddress } from "../Context/constants";

// INTERNAL IMPORT
import NFTDetailsPage from "../NFTDetailsPage/NFTDetailsPage";

// IMPORT SMART CONTRACT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const NFTDetails = () => {
  const { checkIfWalletConnected, getNFTTransactionHistory } = useContext(NFTMarketplaceContext);

  const [nft, setNft] = useState({
    image: "",
    tokenId: "",
    name: "",
    owner: "",
    price: "",
    seller: "",
  });

  const [transactions, setTransactions] = useState([]);

  const router = useRouter();

  useEffect(() => {
    checkIfWalletConnected();
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setNft(router.query);
  }, [router.isReady]);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (nft.tokenId) {
        try {
          const history = await getNFTTransactionHistory(nft.tokenId);
          // console.log("Historial de transacciones:", history);
          // Ordenar las transacciones y agregar la lógica para la columna "Acción"
          const sortedHistory = history
            .sort((a, b) => b.blockNumber - a.blockNumber)
            .map((tx) => ({
              ...tx,
              from: tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.from,
              to: tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.to,
              action: determineAction(tx, NFTMarketplaceAddress),
            }));

            console.log("Historial de transacciones ordenado:", sortedHistory);

          setTransactions(sortedHistory);
        } catch (error) {
          console.error("Error al obtener el historial de transacciones:", error);
        }
      }
    };

    fetchTransactionHistory();
  }, [nft.tokenId, getNFTTransactionHistory, NFTMarketplaceAddress]);

  // Lógica para determinar la acción basada en la transacción
  const determineAction = (tx, NFTMarketplaceAddress) => {
    if (tx.from === "0x0000000000000000000000000000000000000000") {
      return "Creación";
    }
    if (tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase()) {
      return "Publicación";
    }
    if (tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase()) {
      return "Compra";
    }
    return "Transferencia";
  };

  // Definición de las columnas para la tabla de AntD
  const columns = [
    {
      title: "De",
      dataIndex: "from",
      key: "from",
      style: { padding: '4px' },
    },
    {
      title: "Para",
      dataIndex: "to",
      key: "to",
      style: { padding: '4px' },
    },
    {
      title: "Hash de Transacción",
      dataIndex: "transactionHash",
      key: "transactionHash",
      render: (text) => (
        <a
          href={`https://etherscan.io/tx/${text}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text.substring(0, 10)}...
        </a>
      ),
      style: { padding: '4px' },
    },
    {
      title: "Número de Bloque",
      dataIndex: "blockNumber",
      key: "blockNumber",
      style: { padding: '4px' },
    },
    {
      title: "Acción",
      dataIndex: "action",
      key: "action",
      style: { padding: '4px' },
    },
  ];

  return (
    <div className="NFTDetailsPage">
      <NFTDetailsPage nft={nft} />
      <div className="transaction-history">
        <h2>Historial de Transacciones</h2>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="transactionHash"
          pagination={{ pageSize: 5 }}
          bordered
          locale={{ emptyText: "No se encontraron transacciones para este NFT." }}
        />
      </div>
      <style jsx>{`
        .transaction-history {
          width: 80%;
          margin: 0 auto;
          margin-top: 2rem;
        }

        h2 {
          margin-bottom: 1rem;
          font-size: 24px;
          text-align: center;
        }

        @media screen and (max-width: 50em) {
          .transaction-history {
            width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default NFTDetails;

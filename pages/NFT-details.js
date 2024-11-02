import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { Table, Button, Modal, Tooltip, Upload, message } from "antd";
import { UploadOutlined, CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined, EyeOutlined, CopyOutlined, DownloadOutlined  } from '@ant-design/icons';
import { NFTMarketplaceAddress } from "../Context/constants";
import { saveAs } from "file-saver";
import Papa from "papaparse";

// INTERNAL IMPORT
import NFTDetailsPage from "../NFTDetailsPage/NFTDetailsPage";

// IMPORT SMART CONTRACT DATA
import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";

const NFTDetails = () => {
  const { checkIfWalletConnected, getNFTTransactionHistory, getNFTCertificateHash, generateFileHash } = useContext(NFTMarketplaceContext);

  const [nft, setNft] = useState({
    image: "",
    tokenId: "",
    name: "",
    owner: "",
    price: "",
    seller: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [certificateHash, setCertificateHash] = useState(""); // Estado para el hash del certificado
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isAuthenticityModalVisible, setIsAuthenticityModalVisible] = useState(false);

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
          const sortedHistory = history
            .sort((a, b) => b.blockNumber - a.blockNumber)
            .map((tx) => ({
              ...tx,
              fromDisplay: tx.from?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.from,
              toDisplay: tx.to?.toLowerCase() === NFTMarketplaceAddress?.toLowerCase() ? "Mercado" : tx.to,
              metodo: determineMethod(tx, NFTMarketplaceAddress),
              formattedTimestamp: tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "N/A",
              relativeTime: tx.timestamp ? formatTimeAgo(tx.timestamp) : "N/A",
              item: nft.tokenId,
            }));

          setTransactions(sortedHistory);
        } catch (error) {
          console.error("Error al obtener el historial de transacciones:", error);
        }
      }
    };

    fetchTransactionHistory();
  }, [nft.tokenId, getNFTTransactionHistory, NFTMarketplaceAddress]);

  useEffect(() => {
    const fetchCertificateHash = async () => {
      if (nft.tokenId) {
        try {
          const hash = await getNFTCertificateHash(nft.tokenId);
          setCertificateHash(hash);
        } catch (error) {
          console.error("Error fetching certificate hash:", error);
        }
      }
    };

    fetchCertificateHash();
  }, [nft.tokenId, getNFTCertificateHash]);

  // Verificar autenticidad con el archivo subido
  const handleFileUpload = async (file) => {
    try {
      const fileHash = await generateFileHash(file);
      const formattedFileHash = fileHash.toLowerCase();
      const formattedCertificateHash = certificateHash.replace(/^0x/, "").toLowerCase();

      // Configuración de mensajes según el resultado
      if (formattedFileHash === formattedCertificateHash) {
        setVerificationStatus({
          title: "Verificación de Autenticidad Completa",
          content: "Autenticidad Verificada: El archivo proporcionado coincide con el registro oficial de certificación en la blockchain.",
          status: "success",
        });
      } else {
        setVerificationStatus({
          title: "Advertencia de Autenticidad",
          content: "El archivo cargado no coincide con el certificado registrado. La autenticidad del archivo no está confirmada.",
          status: "error",
        });
      }
    } catch (error) {
      console.error("Error al verificar el archivo:", error);
      setVerificationStatus({
        title: "Error en la Verificación",
        content: "Se ha producido un error en el proceso de verificación. Por favor, intente nuevamente o contacte a soporte.",
        status: "warning",
      });
    }
    setIsAuthenticityModalVisible(true); // Mostrar el modal con el resultado
  };

  // Función para calcular el tiempo transcurrido
  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    const intervals = [
      { label: 'año', seconds: 31536000 },
      { label: 'mes', seconds: 2592000 },
      { label: 'día', seconds: 86400 },
      { label: 'hora', seconds: 3600 },
      { label: 'minuto', seconds: 60 },
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `hace ${count} ${interval.label}${count > 1 ? 's' : ''}`;
      }
    }
    return "ahora";
  };

  const handleCloseModal = () => {
    setIsAuthenticityModalVisible(false);
  };

  // Lógica para determinar el método basado en la transacción
  const determineMethod = (tx, NFTMarketplaceAddress) => {
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

  // Función para descargar el historial de transacciones como CSV
  const downloadCSV = () => {
    const csvData = transactions.map((tx) => ({
      "Hash de Transacción": tx.transactionHash,
      Método: tx.metodo,
      "Bloque": tx.blockNumber,
      "Fecha y Hora": tx.formattedTimestamp,
      De: tx.from,
      Para: tx.to,
      Item: `#${tx.item}`,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Historial_Transacciones_${nft.tokenId}.csv`);
  };

  // Función para copiar al portapapeles y mostrar un mensaje
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Copiado al portapapeles");
  };

  // Abrir el modal con los detalles de la transacción
  const showTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTransaction(null);
  };

  // Columnas de la tabla con estilo similar al de la imagen
  const columns = [
    {
      title: <EyeOutlined />,
      dataIndex: "view",
      key: "view",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined style={{ fontSize: "16px", color: "#1890ff" }} />}
          onClick={() => showTransactionDetails(record)}
        />
      ),
    },
    {
      title: "Hash de Transacción",
      dataIndex: "transactionHash",
      key: "transactionHash",
      align: "left",
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <a
              href={`https://cardona-zkevm.polygonscan.com/tx/${text}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '14px', color: '#1890ff', marginRight: '8px' }}
            >
              {text.substring(0, 10)}...{text.slice(-10)}
            </a>
            <CopyOutlined onClick={() => copyToClipboard(text)} style={{ cursor: 'pointer', color: '#1890ff' }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Método",
      dataIndex: "metodo",
      key: "metodo",
      align: "center",
      render: (text) => <Button size="small" style={{ color: "#1890ff", border: "1px solid #1890ff" }}>{text}</Button>,
    },
    {
      title: "Bloque",
      dataIndex: "blockNumber",
      key: "blockNumber",
      align: "center",
      render: (text) => (
        <a
          href={`https://cardona-zkevm.polygonscan.com/block/${text}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '14px', color: '#1890ff' }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Edad",
      dataIndex: "relativeTime",
      key: "relativeTime",
      align: "center",
      render: (text, record) => (
        <Tooltip title={record.formattedTimestamp}>
          <span style={{ fontSize: '14px' }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "De",
      dataIndex: "fromDisplay",
      key: "from",
      align: "left",
      render: (text, record) => (
        <Tooltip title={record.from}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#1890ff', marginRight: '8px' }}>
              {text.length > 15 ? `${text.substring(0, 10)}...${text.slice(-10)}` : text}
            </span>
            <CopyOutlined onClick={() => copyToClipboard(record.from)} style={{ cursor: 'pointer', color: '#1890ff' }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Para",
      dataIndex: "toDisplay",
      key: "to",
      align: "left",
      render: (text, record) => (
        <Tooltip title={record.to}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#1890ff', marginRight: '8px' }}>
              {text.length > 15 ? `${text.substring(0, 10)}...${text.slice(-10)}` : text}
            </span>
            <CopyOutlined onClick={() => copyToClipboard(record.to)} style={{ cursor: 'pointer', color: '#1890ff' }} />
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Item",
      dataIndex: "item",
      key: "item",
      align: "center",
      render: (text) => <span style={{ fontSize: '14px' }}>#{text}</span>,
    },
  ];

  // Configuración para la carga de archivos
  const uploadProps = {
    beforeUpload: (file) => {
      handleFileUpload(file);
      return false; // Evita que el archivo se cargue automáticamente
    },
    showUploadList: false,
  };

  // Función para descargar los detalles de la transacción en formato JSON
  const downloadTransactionDetails = (transaction) => {
    const transactionData = {
      "Hash de Transacción": transaction.transactionHash,
      Método: transaction.metodo,
      Bloque: transaction.blockNumber,
      // Edad: transaction.relativeTime,
      De: transaction.from,
      Para: transaction.to,
      Item: `#${transaction.item}`,
      "Fecha y Hora": transaction.formattedTimestamp,
      "Certificado Hash": certificateHash
    };

    const blob = new Blob([JSON.stringify(transactionData, null, 2)], { type: "application/json" });
    saveAs(blob, `Detalles_Transaccion_${transaction.transactionHash}.json`);
  };

  // Función para descargar el certificado de verificación de autenticidad
  const downloadVerificationCertificate = () => {
    const certificateData = {
      resultado: verificationStatus.status === "success" ? "Autenticidad Verificada" : "Autenticidad No Verificada",
      mensaje: verificationStatus.content,
      "hash del archivo": verificationStatus.status === "success" ? verificationStatus.fileHash : "No verificado",
      "hash en blockchain": certificateHash,
      fecha: new Date().toLocaleString(),
      tokenId: nft.tokenId,
    };

    const blob = new Blob([JSON.stringify(certificateData, null, 2)], { type: "application/json" });
    saveAs(blob, `Certificado_Verificacion_${nft.tokenId}.json`);
  };

  // Función para descargar el certificado de verificación en JSON
  const downloadCertificate = () => {
    const certificateData = {
      certificado: certificateHash,
      fecha: new Date().toLocaleString(),
      tokenId: nft.tokenId,
    };

    const blob = new Blob([JSON.stringify(certificateData, null, 2)], { type: "application/json" });
    saveAs(blob, `Certificado_${nft.tokenId}.json`);
  };

  return (
    <div className="NFTDetailsPage">
      <NFTDetailsPage nft={nft} />

      {/* Sección del Certificado de Verificación */}
      <div className="verification-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "100%", maxWidth: "800px", margin: "0 auto", padding: "20px", textAlign:  'center' }}>
      {/* Sección del Certificado de Verificación */}
      <div className="certificate-section" style={{ width: "100%", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
        <h3 style={{ color: "#1890ff", fontSize: "20px", fontWeight: "600", marginBottom: "8px", marginTop: '0' }}>Certificado de Verificación</h3>
        
        {/* Mostrar el Hash del Certificado */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px", justifyContent: 'center' }}>
          <span style={{ color: "#555", fontSize: "15px", marginRight: "8px" }}>
            {certificateHash ? `${certificateHash.substring(0, 15)}...${certificateHash.slice(-15)}` : "No disponible"}
          </span>
          <Tooltip title="Copiar Hash del Certificado">
            <Button
              type="link"
              onClick={() => copyToClipboard(certificateHash)}
              icon={<CopyOutlined />}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
        </div>

        {/* Botón para Descargar el Certificado en JSON */}
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={downloadCertificate}
          style={{ fontWeight: "bold", backgroundColor: "#1890ff", borderColor: "#1890ff" }}
        >
          Descargar Certificado en JSON
        </Button>
      </div>

      {/* Sección de Verificación de Autenticidad */}
      <div className="verification-section" style={{ width: "100%", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
        <h3 style={{ color: "#1890ff", fontSize: "20px", fontWeight: "600", marginBottom: "15px", marginTop: "0" }}>Verificación de Autenticidad</h3>
        <Upload {...uploadProps}>
          <Button
            icon={<UploadOutlined />}
            type="primary"
            style={{ fontWeight: "bold", backgroundColor: "#1890ff", borderColor: "#1890ff" }}
          >
            Subir archivo para verificar
          </Button>
        </Upload>
      </div>
      </div>

      {/* Modal para mostrar el resultado de la verificación */}
      {verificationStatus && (
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {verificationStatus.status === "success" && (
                <CheckCircleOutlined style={{ color: "#4caf50", fontSize: "28px", marginRight: "12px" }} />
              )}
              {verificationStatus.status === "error" && (
                <ExclamationCircleOutlined style={{ color: "#e53935", fontSize: "28px", marginRight: "12px" }} />
              )}
              {verificationStatus.status === "warning" && (
                <WarningOutlined style={{ color: "#ffa000", fontSize: "28px", marginRight: "12px" }} />
              )}
              <span style={{ fontWeight: "600", fontSize: "20px", color: "#333" }}>{verificationStatus.title}</span>
            </div>
          }
          visible={isAuthenticityModalVisible}
          onCancel={handleCloseModal}
          footer={[
            <Button key="close" type="primary" onClick={handleCloseModal} style={{ fontWeight: "bold", padding: "6px 16px" }}>
              Cerrar
            </Button>,
            <Button key="download" icon={<DownloadOutlined />} onClick={downloadVerificationCertificate} style={{ fontWeight: "bold", color: "#1890ff" }}>
              Descargar Verificación
            </Button>,
          ]}
          centered
          bodyStyle={{
            fontSize: "16px",
            padding: "24px",
            lineHeight: "1.6",
            color: "#333",
            backgroundColor: "#f7f7f7",
          }}
        >
          <div style={{
            marginBottom: "12px",
            fontSize: "17px",
            fontWeight: "500",
            color: verificationStatus.status === "success" ? "#4caf50" : verificationStatus.status === "error" ? "#e53935" : "#ffa000",
          }}>
            {verificationStatus.status === "success"
              ? "Resultado de la Verificación"
              : verificationStatus.status === "error"
              ? "Advertencia Importante"
              : "Información de Verificación"}
          </div>
          <div style={{
            fontSize: "15px",
            color: "#555",
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            {verificationStatus.content}
          </div>
        </Modal>
      )}

      <div className="transaction-history">
        {/* Sección de resumen de transacciones y verificación de autenticidad */}
        <div className="transaction-summary">
          <span>{`Se encontró un total de ${transactions.length} transacciones`}</span>
          <Tooltip title="Descargar Datos de Transacciones">
            <Button icon={<DownloadOutlined />} onClick={downloadCSV} style={{ marginLeft: "auto", fontSize: "14px", color: '#1890ff' }}> Descargar Datos de Transacciones</Button> 
          </Tooltip>
        </div>

        {/* Sección de tabla de historial de transacciones */}
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="transactionHash"
          pagination={{ pageSize: 10 }}
          bordered={false}
          locale={{ emptyText: "No se encontraron transacciones para este Activo Digital." }}
          style={{ fontSize: '14px', borderRadius: '8px', overflow: 'hidden' }}
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        />

        {/* Botón de descarga estilo "CSV Export" */}
        <div className="download-section">
          [ Descarga: <Button onClick={downloadCSV} type="link" style={{ color: '#1890ff' }}>
            <span style={{ textDecoration: 'underline', fontSize: '12px' }}>Exportar CSV</span>
          </Button> ]
        </div>

        {/* Modal de Detalles de la Transacción */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <EyeOutlined style={{ color: "#1890ff", fontSize: "22px", marginRight: "8px" }} />
              <span style={{ fontSize: "20px", fontWeight: "600", color: "#333" }}>Detalles de la Transacción</span>
            </div>
          }
          visible={isModalVisible}
          onCancel={closeModal}
          footer={null}
          className="transaction-details-modal"
          bodyStyle={{
            padding: "24px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          {selectedTransaction && (
            <div style={{ fontSize: "16px", color: "#555", lineHeight: "1.8" }}>
              <div style={{ display: "flex", marginBottom: "12px" }}>
                <span style={{ display: 'inline-block', marginRight: '5px' }}><strong>Hash de Transacción:</strong></span>
                <Tooltip title="Copiar al portapapeles">
                  <span style={{ color: "#1890ff", cursor: "pointer" }} onClick={() => copyToClipboard(selectedTransaction.transactionHash)}>
                    {selectedTransaction.transactionHash.substring(0, 10)}...{selectedTransaction.transactionHash.slice(-10)} <CopyOutlined />
                  </span>
                </Tooltip>
              </div>

              <p><strong>Método:</strong> <Button size="small" style={{ color: "#1890ff", borderColor: "#1890ff" }}>{selectedTransaction.metodo}</Button></p>
              <p><strong>Bloque:</strong> {selectedTransaction.blockNumber}</p>
              {/* <p><strong>Edad:</strong> {selectedTransaction.relativeTime}</p> */}
              <p><strong>De:</strong> {selectedTransaction.from}</p>
              <p><strong>Para:</strong> {selectedTransaction.to}</p>
              <p><strong>Item:</strong> #{selectedTransaction.item}</p>
              <p><strong>Fecha y Hora:</strong> {selectedTransaction.formattedTimestamp}</p>

              <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#ffffff", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
                <p style={{ margin: "0", fontWeight: "500", color: "#1890ff" }}><strong>Certificado Hash:</strong></p>
                <Tooltip title="Copiar Certificado Hash">
                  <Button type="link" onClick={() => copyToClipboard(certificateHash)} style={{ padding: 0, fontSize: "15px", color: "#1890ff" }}>
                    {certificateHash.substring(0, 15)}...{certificateHash.slice(-15)} <CopyOutlined />
                  </Button>
                </Tooltip>
              </div>

              {/* Botón para descargar los detalles */}
              <div style={{ textAlign: "right", marginTop: "20px" }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => downloadTransactionDetails(selectedTransaction)}
                  style={{ fontWeight: "bold" }}
                >
                  Descargar Detalles
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
      <style jsx global>{`
        .certificate-section {
          margin-top: 20px;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .verification-section {
          text-align: center;
          margin: 20px 0;
        }

        .transaction-history {
          width: 90%;
          margin: 0 auto;
          margin-top: 2rem;
        }

        .transaction-summary {
          display: flex;
          align-items: center;
          font-size: 14px;
          margin-bottom: 10px;
        }

        .authenticity-checker {
          width: 90%;
          margin: 2rem auto;
          text-align: center;
        }

        .transaction-details-modal {
          top: 10px;
        }

        h2 {
          margin-bottom: 1rem;
          font-size: 24px;
          text-align: center;
        }

        .download-section {
          font-size: 12px;
          text-align: right;
          margin-top: 10px;
          padding-right: 0;
          padding-left: 0;
        }

        .table-row-light {
          background-color: #f9f9f9;
        }

        .table-row-dark {
          background-color: #ffffff;
        }

        .ant-table-wrapper .ant-table-cell,
        .ant-table-wrapper .ant-table-thead > tr > th,
        .ant-table-wrapper .ant-table-tbody > tr > th,
        .ant-table-wrapper .ant-table-tbody > tr > td,
        .ant-table-wrapper tfoot > tr > th,
        .ant-table-wrapper tfoot > tr > td {
          padding: 4px !important;
        }

        .ant-table-thead > tr > th {
          background-color: transparent !important;
          font-weight: bold;
          text-align: center;
          border-bottom: 1px solid #e8e8e8;
        }

        .ant-table-cell {
          border-right: none !important;
        }

        .ant-table-row {
          transition: background 0.3s;
        }

        .ant-table-row:hover {
          background-color: #e6f7ff;
        }

        @media screen and (max-width: 50em) {
          .transaction-history {
            width: 100%;
          }
          .authenticity-checker {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default NFTDetails;

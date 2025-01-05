[Receiver] Opens page, QR code visible
[Receiver] Creates UUID and inserts Firestore entry with Offer
[Sender] Opens page, uses camera to scan QR code
[Sender] Gets UUID of receiver
[Sender] Queries Firestore with receiver UUID to get Receiver Offer SDP
[Sender] Updates Firestore entry with Answer Offer SDP in field
[Receiver] Notified by Firestore that Answer Offser SDP is available
[Receiver] Queries Firestore to get Sender Answer SDP
[Receiver] Deletes own entry from Firestore
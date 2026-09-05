// Original approvals do not authenticate sanitized subject bytes.
export function assertPublicationNotWithdrawn(packet) {
  if (packet?.packet_id === "CURVE-M1-01B" && packet.packet_version <= 3) {
    throw new Error("PUBLICATION_WITHDRAWN: fresh source, context and human approval bindings required");
  }
}

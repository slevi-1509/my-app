import sys
from scapy.all import DHCP, Ether, IP
import scapy.layers.dhcp
from collections import OrderedDict

# Store known fingerprints to avoid re-printing for the same MAC
known_macs = {}

def get_dhcp_fingerprint(pkt):
    """
    Extracts the DHCP fingerprint from a packet.
    The fingerprint is the sequence of DHCP option codes requested by the client.
    """
    for option in pkt[DHCP].options:
        # Option 55 is the Parameter Request List
        if option[0] == "param_req_list":
            # The value is a tuple of requested option codes
            # Convert to a human-readable list of names
            requested_options = [
                option_code_to_name(code) for code in option[1]
            ]
            return tuple(requested_options)
    return None

def option_code_to_name(code):
    """
    Looks up the human-readable name for a DHCP option code.
    Fallback to the numerical code if not found in Scapy's dictionary.
    """
    try:
        # Scapy stores the option names in DHCPTypes's rev dict
        dhcp_options = scapy.layers.dhcp.DHCPOptions
        code_to_name = {value: name for value, name in dhcp_options[code]}
        return code_to_name.get(code, str(code))    
    except Exception as e:
        print(f"Error looking up DHCP option code {code}: {e}")
        return str(code)
    
def handle_dhcp_packet(pkt):
    """
    Callback function to process sniffed packets.
    """
    # Filter for DHCP Discover or Request packets
    a = pkt[DHCP].options[0][1]

    if (pkt[DHCP].options[0][1] == 1 or pkt[DHCP].options[0][1] == 3):
        mac_address = pkt[Ether].src
        src_ip = pkt[IP].src
        fingerprint = get_dhcp_fingerprint(pkt)

        # Only process if a fingerprint was found and it's from a new MAC
        if fingerprint: #and mac_address not in known_macs:
            known_macs[mac_address] = fingerprint
            print("-" * 40)
            print(f"New DHCP client detected:")
            print(f"MAC Address: {mac_address}")
            print(f"DHCP Fingerprint (Option 55): {fingerprint}")

# def get_dhcp_fingerprints(packet):
#     print("Starting DHCP fingerprinting. Listening for DHCP Discover/Request packets...")
#     print("Press Ctrl+C to stop.\n")

#     try:
#         # Sniff for DHCP packets (UDP ports 67 or 68) indefinitely
#         sniff(filter="udp and (port 67 or port 68)", prn=handle_dhcp_packet, store=0)
#     except KeyboardInterrupt:
#         print("\nStopping sniffing.")
#         sys.exit(0)
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         sys.exit(1)

# if __name__ == "__main__":
    # Scapy needs to be run with root permissions for sniffing
    # if os.geteuid() != 0:
    #     sys.exit("Error: This script must be run as root (e.g., with sudo).")
    # main()


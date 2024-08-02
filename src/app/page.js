"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
  IconButton,
  Pagination,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { firestore, auth } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  where,
} from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { CSVLink } from "react-csv";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const itemsPerPage = 10;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        updateInventory(user.uid);
      } else {
        setInventory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateInventory = async (userId) => {
    const snapshot = query(
      collection(firestore, "inventory"),
      where("userId", "==", userId)
    );
    const docs = await getDocs(snapshot);
    const inventoryList = docs.docs.map((doc) => ({
      name: doc.id,
      ...doc.data(),
    }));
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    if (!user) return;
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, userId: user.uid });
    } else {
      await setDoc(docRef, { quantity: 1, userId: user.uid });
    }
    await updateInventory(user.uid);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1, userId: user.uid });
      }
    }
    await updateInventory(user.uid);
  };

  const updateItemDetails = async (updatedItem) => {
    const docRef = doc(collection(firestore, "inventory"), updatedItem.name);
    await setDoc(docRef, {
      name: updatedItem.name,
      quantity: updatedItem.quantity,
      userId: user.uid,
    });
    await updateInventory(user.uid);
    closeItemDetails();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in", error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedInventory = filteredInventory.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const openItemDetails = (item) => setSelectedItem(item);
  const closeItemDetails = () => setSelectedItem(null);

  if (!user) {
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Button onClick={signIn} variant="contained">
          Sign in with Google
        </Button>
      </Box>
    );
  }

  return (
    <Box
      width={isMobile ? "100%" : "800px"}
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
      margin="auto"
    >
      <Typography variant="h4" gutterBottom>
        Welcome to your Personal Pantry
      </Typography>
      {user && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            alt={user.displayName}
            src={user.photoURL}
            sx={{ width: 56, height: 56 }}
          />
          <Typography variant="h6">{user.displayName}</Typography>
        </Stack>
      )}
      <Button onClick={signOutUser} variant="outlined">
        Sign Out
      </Button>
      <Stack direction="row" spacing={2} width="100%">
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <TextField
          label="Search items"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <IconButton>
                <SearchIcon />
              </IconButton>
            ),
            style: { borderColor: "white" },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "white",
              },
              "&:hover fieldset": {
                borderColor: "white",
              },
              "&.Mui-focused fieldset": {
                borderColor: "white",
              },
            },
            "& .MuiInputLabel-root": {
              color: "white",
            },
            "& .MuiInputBase-input": {
              color: "white",
            },
          }}
          fullWidth
        />
      </Stack>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={async () => {
                await addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal open={!!selectedItem} onClose={closeItemDetails}>
        <Box sx={style}>
          <Typography variant="h6">Item Details</Typography>
          {selectedItem && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateItemDetails(selectedItem);
              }}
            >
              <TextField
                label="Name"
                value={selectedItem.name}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, name: e.target.value })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Quantity"
                type="number"
                value={selectedItem.quantity}
                onChange={(e) =>
                  setSelectedItem({
                    ...selectedItem,
                    quantity: parseInt(e.target.value),
                  })
                }
                fullWidth
                margin="normal"
              />
              <Button type="submit" variant="contained" fullWidth>
                Save
              </Button>
            </form>
          )}
        </Box>
      </Modal>
      <Box border={"1px solid #333"} width="100%">
        <Box
          width="100%"
          height="100px"
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
            Pantry Items
          </Typography>
        </Box>
        <Stack width="100%" spacing={2} overflow={"auto"}>
          {paginatedInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="100px"
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              bgcolor={"#f0f0f0"}
              paddingX={2}
            >
              <Typography variant={isMobile ? "h5" : "h3"} color={"#333"}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={isMobile ? "body1" : "h5"} color={"#333"}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
              <Button
                variant="outlined"
                onClick={() => openItemDetails({ name, quantity })}
              >
                Details
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
      <Pagination
        count={Math.ceil(filteredInventory.length / itemsPerPage)}
        page={page}
        onChange={(event, value) => setPage(value)}
        sx={{
          "& .MuiPaginationItem-root": {
            color: "white",
          },
          "& .MuiPaginationItem-page.Mui-selected": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
          },
        }}
      />
      <CSVLink
        data={inventory.map(({ name, quantity, description, price }) => ({
          Name: name,
          Quantity: quantity,
          Description: description || "",
          Price: price || "",
        }))}
        filename="inventory.csv"
      >
        <Button variant="contained">Export to CSV</Button>
      </CSVLink>
    </Box>
  );
}

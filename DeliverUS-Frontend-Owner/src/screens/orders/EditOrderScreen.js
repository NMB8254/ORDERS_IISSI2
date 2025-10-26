import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import { Formik } from 'formik'
import { getById, update } from '../../api/OrderEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import TextError from '../../components/TextError'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'

export default function EditOrderScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState()
  const [order, setOrder] = useState({})

  const [initialOrderValues, setInitialOrderValues] = useState({ address: route.params.address, price: null })
  const validationSchema = yup.object().shape({
    address: yup
      .string()
      .max(255, 'Name too long')
      .required('Name is required'),
    price: yup
      .number()
      .positive('Price must be positive')
      .required('Price is required')
  })

  useEffect(() => {
    async function fetchOrders () {
      try {
        const fetchedOrder = await getById(route.params.id)
        setOrder(fetchedOrder)
        setInitialOrderValues({
          address: fetchedOrder.address,
          price: fetchedOrder.price
        })
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving orders.${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchOrders()
  }, [route])

  const updateOrder = async (values) => {
    setBackendErrors([])
    try {
      const updatedOrder = await update(order.id, values)
      showMessage({
        message: `Order ${updatedOrder.id} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('OrdersScreen', { id: order.restaurantId })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  return (
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialOrderValues}
      onSubmit={updateOrder}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='address'
                label='Address:'
              />
              <InputItem
                name='price'
                label='Price:'
              />

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={ handleSubmit }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  }
})
